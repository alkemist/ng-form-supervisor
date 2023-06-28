import {CompareHelper, ValueKey} from "@alkemist/compare-engine";
import {Observable} from "rxjs";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormSupervisor} from "./form-supervisor.js";
import {SupervisorHelper} from "./supervisor.helper.js";
import {ControlValueType, FormArrayItemInterfaceType, FormGroupInterface, ValueRecordForm} from "./form.type.js";
import {FormOptions} from "./form.interface.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";

export class FormArraySupervisor<
    DATA_TYPE,
    FORM_TYPE extends FormControl | FormGroup = DATA_TYPE extends ValueRecordForm
        ? FormControl<DATA_TYPE | null> | FormGroup<FormGroupInterface<DATA_TYPE>>
        : FormControl<DATA_TYPE | null>,
    SUPERVISOR_TYPE extends FormSupervisor =
        DATA_TYPE extends ValueRecordForm
            ? FORM_TYPE extends FormGroup
                ? FormGroupSupervisor<DATA_TYPE>
                : FormControlSupervisor<DATA_TYPE>
            : FormControlSupervisor<DATA_TYPE>,
> extends FormSupervisor<
    DATA_TYPE[],
    FormArray<FORM_TYPE>
> {
    protected itemType: FormArrayItemInterfaceType<DATA_TYPE>;
    protected supervisors: SUPERVISOR_TYPE[] = [];
    protected _items: FormArray<FORM_TYPE>;

    constructor(
        items: FormArray<FORM_TYPE>,
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
        itemType?: FormArrayItemInterfaceType<DATA_TYPE>
    ) {
        super(determineArrayIndexFn);
        this._items = items;
        this.itemType = itemType ?? SupervisorHelper.extractFormGroupInterface<DATA_TYPE, FORM_TYPE>(this._items);

        this.onChange(this.value);

        this.updateInitialValue();

        this.sub.add(this.valueChanges.subscribe((itemsValue) => {
            this.onChange(itemsValue)
        }));
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

    get valueChanges(): Observable<ControlValueType<FormArray<FORM_TYPE>>> {
        return this._items.valueChanges;
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
        const item = SupervisorHelper.factoryItem<DATA_TYPE, FORM_TYPE>(
            this.itemType as FormArrayItemInterfaceType<DATA_TYPE>,
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

    protected onChange(itemsValue: DATA_TYPE[] | undefined) {
        super.onChange(itemsValue);
        this.supervisors = [];

        if (itemsValue) {
            if (!CompareHelper.isObject(itemsValue) && CompareHelper.isArray<DATA_TYPE>(itemsValue)) {
                itemsValue.forEach((itemValue, index) => {
                    const control = this._items.controls[index] as FORM_TYPE;

                    const supervisor =
                        SupervisorHelper.factory<DATA_TYPE[], FORM_TYPE, SUPERVISOR_TYPE>(
                            control, this.determineArrayIndexFn
                        )

                    if (CompareHelper.isEvaluable(this.compareEngine.leftValue) && CompareHelper.isArray(this.compareEngine.leftValue)) {
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