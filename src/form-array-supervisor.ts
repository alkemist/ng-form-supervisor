import {CompareHelper, ValueKey} from "@alkemist/compare-engine";
import {Observable} from "rxjs";
import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormSupervisor} from "./form-supervisor.js";
import {SupervisorHelper} from "./supervisor.helper.js";
import {
    ControlRawValueType,
    ControlValueType,
    FormArrayType,
    FormGroupInterface,
    ValueForm,
    ValueRecordForm
} from "./form.type.js";
import {FormOptions} from "./form.interface.js";

export class FormArraySupervisor<
    DATA_TYPE extends ValueForm,
    FORM_TYPE extends FormArray<FormControl> = DATA_TYPE extends ValueRecordForm
        ? FormArray<FormGroup<FormGroupInterface<DATA_TYPE>>>
        : FormArray<FormControl<DATA_TYPE | null>>
> extends FormSupervisor<(DATA_TYPE | null)[], FORM_TYPE> {
    supervisors: FormSupervisor<DATA_TYPE>[] = [];
    items: FORM_TYPE;

    constructor(items: FormArrayType<DATA_TYPE>, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined);
    constructor(items: FORM_TYPE, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined) {
        super(determineArrayIndexFn);
        this.items = items;

        this.onChange(this.value);

        this.updateInitialValue();

        this.sub.add(this.valueChanges.subscribe((itemsValue) => {
            this.onChange(itemsValue)
        }));
    }

    get valid(): boolean {
        return this.items.valid;
    }

    get value(): ControlValueType<FORM_TYPE> | DATA_TYPE[] {
        return this.items.value;
    }

    get valueChanges(): Observable<ControlValueType<FORM_TYPE> | DATA_TYPE[]> {
        return this.items.valueChanges;
    }

    setValue(itemsValue: ControlRawValueType<FORM_TYPE> | DATA_TYPE[], options?: FormOptions) {
        this.items.setValue(itemsValue);
    }

    reset(options?: FormOptions) {
        this.items.reset();
    }

    at(index: number): FormSupervisor<DATA_TYPE> {
        const supervisor = this.supervisors.at(index);

        if (!supervisor) {
            throw new Error(`Unknown supervisor index "${index}"`);
        }

        return supervisor;
    }

    add(itemValue: DATA_TYPE, options?: FormOptions) {
        this.items.push(new FormControl<DATA_TYPE>(itemValue))
    }

    protected onChange(itemsValue: ControlValueType<FORM_TYPE> | DATA_TYPE[]) {
        super.onChange(itemsValue);
        //console.log("- array change", itemsValue);

        if (!CompareHelper.isObject(itemsValue) && CompareHelper.isArray<DATA_TYPE>(itemsValue)) {
            this.supervisors = itemsValue.map((itemValue, index) => {
                const supervisor = SupervisorHelper.factory(this.items.controls[index] as AbstractControl)

                //console.log("-- item current itemValue", supervisor.itemValue);

                if (this.compareEngine.leftValue) {
                    supervisor.updateInitialValue(this.compareEngine.leftValue.at(index));
                    //console.log("-- item initial itemValue", this.compareEngine.leftValue.at(index));
                }
                //console.log("-- item has change ?", supervisor.hasChange());
                //console.log("-- item has change ?", supervisor.compareEngine);

                return supervisor;
            })
        }
    }
}