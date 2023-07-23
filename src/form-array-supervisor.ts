import {CompareHelper, ValueKey} from "@alkemist/compare-engine";
import {Observable} from "rxjs";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormSupervisor} from "./form-supervisor.js";
import {SupervisorHelper} from "./supervisor.helper.js";
import {ControlValueType, FormArrayItemConfigurationType, GetFormArrayGenericClass} from "./form.type.js";
import {FormOptions} from "./form.interface.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";

export abstract class FormArraySupervisor<
    DATA_TYPE,
    FORM_TYPE extends FormArray,
    SUPERVISOR_TYPE extends FormSupervisor<DATA_TYPE> =
        GetFormArrayGenericClass<FORM_TYPE> extends FormGroup
            ? FormGroupSupervisor<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>
            : FormControlSupervisor<DATA_TYPE>,
> extends FormSupervisor<
    DATA_TYPE[],
    FORM_TYPE
> {
    protected itemType: FormArrayItemConfigurationType<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>;
    protected supervisors: SUPERVISOR_TYPE[] = [];
    protected _items: FORM_TYPE;

    protected constructor(
        items: FORM_TYPE,
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
        itemType?: FormArrayItemConfigurationType<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>,
    ) {
        super(determineArrayIndexFn);

        this._items = items;
        this.itemType = itemType ?? SupervisorHelper.extractFormGroupInterface<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>(this._items);

        this.updateInitialValue();

        this.onChange(this.value);

        this.sub.add(this.valueChanges.subscribe((itemsValue) => {
            if (this.showLog) {
                console.log('[Array] Change detected', itemsValue)
            }

            this.onChange(itemsValue)
        }));
    }

    get form(): FORM_TYPE {
        return this._items;
    }

    get valid(): boolean {
        return this._items.valid;
    }

    get length(): number {
        return this._items.length;
    }

    get value(): DATA_TYPE[] | undefined {
        return this._items.value;
    }

    get valueChanges(): Observable<ControlValueType<FormArray<GetFormArrayGenericClass<FORM_TYPE>>>> {
        return this._items.valueChanges as Observable<ControlValueType<FormArray<GetFormArrayGenericClass<FORM_TYPE>>>>;
    }

    setValue(itemsValue: DATA_TYPE[] | undefined, options?: FormOptions) {
        const emitEvent = options?.emitEvent ?? true;
        if (this.showLog) {
            console.log('[Array] Set value', emitEvent, itemsValue)
        }

        if (itemsValue) {
            itemsValue.forEach(
                (itemValue, index) => {
                    if (index < this._items.length) {
                        this.at(index).setValue(itemValue, {emitEvent: false});
                    } else {
                        this.push(itemValue, {emitEvent: false});
                    }
                });
        }

        if (!itemsValue || this._items.length > itemsValue.length) {
            const firstIndex = itemsValue ? itemsValue.length : 0;
            const itemLength = this._items.length;
            for (let i = firstIndex; i < itemLength; i++) {
                this.remove(firstIndex, {emitEvent: false});
            }
        }

        if (itemsValue) {
            this._items.setValue(itemsValue, {emitEvent: emitEvent});
        }

        if (!emitEvent) {
            // Si on ne passe pas par l'évènement de mise à jour
            // on met à jour le moteur de comparaison manuellement
            this.onChange(itemsValue);
        }
    }

    move(oldIndex: number, newIndex: number) {
        console.log('@TODO', oldIndex, '=>', newIndex);
    }

    patchValue(value: DATA_TYPE[], options?: FormOptions) {
        this._items.patchValue(value, options);
    }

    reset(options?: FormOptions) {
        this._items.reset(options);
    }

    clear(options?: FormOptions) {
        this._items.clear(options);
    }

    at(index: number): SUPERVISOR_TYPE {
        const supervisor = this.supervisors.at(index);

        if (!supervisor) {
            throw new Error(`Unknown supervisor index "${index}"`);
        }

        return supervisor;
    }

    push(itemValue: DATA_TYPE, options?: FormOptions) {
        const item = SupervisorHelper.factoryItem<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>(
            this.itemType,
            itemValue
        );

        if (this.showLog) {
            console.log('[Array] Add item', item, item.value)
        }

        this._items.push(item, options);
    }

    insert(itemValue: DATA_TYPE, index: number, options?: FormOptions) {
        const item = SupervisorHelper.factoryItem<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>(
            this.itemType,
            itemValue
        );

        this._items.insert(item, index, options);
    }

    remove(index: number, options?: FormOptions) {
        this._items.removeAt(index, options);
    }

    splice(start: number, deleteCount?: number) {
        Array.from({
                length: deleteCount ?? this._items.length - start
            },
            (_, i) =>
                this._items.removeAt(start + i)
        );
    }

    updateInitialValue(value?: DATA_TYPE[] | undefined) {
        this.supervisors.forEach((supervisor, index) =>
            supervisor.updateInitialValue(value ? value[index] : undefined))

        super.updateInitialValue(value);
    }

    restore(options?: FormOptions) {
        this.supervisors.forEach((supervisor) =>
            supervisor.restore(options)
        );

        super.restore(options);
    }

    enableLog() {
        super.enableLog();
        this.supervisors.forEach((supervisor) =>
            supervisor.enableLog());
    }

    disableLog() {
        super.disableLog();
        this.supervisors.forEach((supervisor) =>
            supervisor.disableLog());
    }

    onChange(itemsValue: DATA_TYPE[] | undefined) {
        super.onChange(itemsValue);
        this.supervisors = [];

        if (itemsValue) {
            if (!CompareHelper.isObject(itemsValue) && CompareHelper.isArray<DATA_TYPE>(itemsValue)) {

                itemsValue.forEach((itemValue, index) => {

                    if (this._items.controls[index] === undefined) {
                        this.push(itemValue);
                    }

                    const control =
                        this._items.controls[index] as GetFormArrayGenericClass<FORM_TYPE>;

                    const supervisor =
                        SupervisorHelper.factory<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>, SUPERVISOR_TYPE>(
                            control,
                            this.determineArrayIndexFn,
                            this.itemType
                        )

                    if (CompareHelper.isEvaluable(this.compareEngine.leftValue)
                        && CompareHelper.isArray(this.compareEngine.leftValue)) {

                        supervisor.updateInitialValue(
                            this.compareEngine.leftValue.at(index) as DATA_TYPE
                        );
                    }

                    this.supervisors.push(supervisor);
                })
            }
        }
    }
}

export class FormArrayControlSupervisor<
    DATA_TYPE
> extends FormArraySupervisor<
    DATA_TYPE,
    FormArray<FormControl<DATA_TYPE | null>>
> {
    constructor(
        items: FormArray<FormControl<DATA_TYPE | null>>,
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
        itemType?: FormArrayItemConfigurationType<DATA_TYPE, FormControl<DATA_TYPE | null>>,
    ) {
        super(items, determineArrayIndexFn, itemType);
    }
}

export class FormArrayGroupSupervisor<
    DATA_TYPE,
    FORM_TYPE extends FormArray,
> extends FormArraySupervisor<
    DATA_TYPE,
    FORM_TYPE
> {
    constructor(
        items: FORM_TYPE,
        values: DATA_TYPE[],
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
        itemType?: FormArrayItemConfigurationType<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>,
    ) {
        super(items, determineArrayIndexFn, itemType);
    }
}