import {CompareHelper, ValueKey} from "@alkemist/compare-engine";
import {Observable} from "rxjs";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormSupervisor} from "./form-supervisor.js";
import {SupervisorHelper} from "./supervisor.helper.js";
import {ControlValueType, FormArrayItemInterfaceType, GetFormArrayGenericClass} from "./form.type.js";
import {FormOptions} from "./form.interface.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";

export class FormArraySupervisor<
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
    protected itemType: FormArrayItemInterfaceType<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>;
    protected supervisors: SUPERVISOR_TYPE[] = [];
    protected _items: FORM_TYPE;

    constructor(
        items: FORM_TYPE,
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
        itemType?: FormArrayItemInterfaceType<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>,
        showLog = false,
    ) {
        super(determineArrayIndexFn, showLog);

        this._items = items;
        this.itemType = itemType ?? SupervisorHelper.extractFormGroupInterface<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>(this._items);

        this.updateInitialValue();

        this.onChange(this.value);

        this.sub.add(this.valueChanges.subscribe((itemsValue) => {
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
        this._items.clear();
        itemsValue?.forEach(itemValue => this.add(itemValue));
    }

    reset(options?: FormOptions) {
        this._items.reset();
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

    add(itemValue: DATA_TYPE, options?: FormOptions) {
        const item = SupervisorHelper.factoryItem<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>(
            this.itemType as FormArrayItemInterfaceType<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>,
            itemValue
        );

        this._items.push(item, options);
        return item;
    }

    remove(index: number) {
        this._items.removeAt(index);
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
        if (value) {
            this.supervisors.forEach((supervisor, index) =>
                supervisor.updateInitialValue(value[index]))
        }

        super.updateInitialValue(value);
    }

    protected onChange(itemsValue: DATA_TYPE[] | undefined) {
        super.onChange(itemsValue);
        this.supervisors = [];

        if (itemsValue) {
            if (!CompareHelper.isObject(itemsValue) && CompareHelper.isArray<DATA_TYPE>(itemsValue)) {
                itemsValue.forEach((itemValue, index) => {
                    const control = this._items.controls[index] as GetFormArrayGenericClass<FORM_TYPE>;

                    const supervisor =
                        SupervisorHelper.factory<DATA_TYPE[], GetFormArrayGenericClass<FORM_TYPE>, SUPERVISOR_TYPE>(
                            control, this.determineArrayIndexFn, undefined, this.showLog
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
        itemType?: FormArrayItemInterfaceType<DATA_TYPE, FormControl<DATA_TYPE | null>>,
        showLog = false,
    ) {
        super(items, determineArrayIndexFn, itemType, showLog);
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
        itemType?: FormArrayItemInterfaceType<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>,
        showLog = false,
    ) {
        super(items, determineArrayIndexFn, itemType, showLog);
    }
}