import {CompareHelper, ValueKey} from "@alkemist/compare-engine";
import {Observable} from "rxjs";
import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormSupervisor} from "./form-supervisor.js";
import {SupervisorHelper} from "./supervisor.helper.js";
import {
    ControlRawValueType,
    ControlValueType,
    FormArrayItemType,
    FormItemInterface,
    ValueFormNullable
} from "./form.type.js";
import {FormOptions} from "./form.interface.js";

export class FormArraySupervisor<
    DATA_TYPE extends ValueFormNullable,
    FORM_TYPE extends FormItemInterface<DATA_TYPE> = FormItemInterface<DATA_TYPE>,
> extends FormSupervisor<DATA_TYPE[], FormArray<FORM_TYPE>> {
    supervisors: FormSupervisor<DATA_TYPE>[] = [];
    items: FormArray<FORM_TYPE>;

    itemType: FormArrayItemType<DATA_TYPE>;

    constructor(items?: FormArray<FormGroup>, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey), itemType?: FormArrayItemType<DATA_TYPE>);
    constructor(items?: FormArray<FormControl>, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey), itemType?: FormArrayItemType<DATA_TYPE>);
    constructor(
        items: FormArray<FORM_TYPE> = new FormArray<FORM_TYPE>([]),
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
        itemType?: FormArrayItemType<DATA_TYPE>
    ) {
        super(determineArrayIndexFn);
        this.items = items;
        this.itemType = itemType ?? SupervisorHelper.extractFormGroupInterface<DATA_TYPE, FORM_TYPE>(items);

        this.onChange(this.value);

        this.updateInitialValue();

        this.sub.add(this.valueChanges.subscribe((itemsValue) => {
            this.onChange(itemsValue)
        }));
    }

    get valid(): boolean {
        return this.items.valid;
    }

    get value(): ControlValueType<FormArray<FORM_TYPE>> | undefined {
        return this.items.value;
    }

    get valueChanges(): Observable<ControlValueType<FormArray<FORM_TYPE>>> {
        return this.items.valueChanges;
    }

    setValue(itemsValue: ControlRawValueType<FormArray<FORM_TYPE>>, options?: FormOptions) {
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
        const item = SupervisorHelper.factoryItem<DATA_TYPE, FORM_TYPE>(
            this.itemType as FormArrayItemType<DATA_TYPE>,
            itemValue
        );
        this.items.push(item, options);
        return item;
    }

    protected onChange(itemsValue: DATA_TYPE[] | undefined) {
        super.onChange(itemsValue);
        //console.log("-- Array change", itemsValue);
        //console.log("-- Is initialization ?", isInitialization)

        if (itemsValue) {
            if (!CompareHelper.isObject(itemsValue) && CompareHelper.isArray<DATA_TYPE>(itemsValue)) {
                this.supervisors = [];
                itemsValue.forEach((itemValue, index) => {
                    // @TODO Si controls est vide ou si itemsValue.length > this.items.controls.length ???
                    const control = this.items.controls[index];

                    if (control) {
                        const supervisor =
                            SupervisorHelper.factory<DATA_TYPE>(
                                control as AbstractControl, this.determineArrayIndexFn
                            )

                        //console.log("-- item current itemValue", supervisor.itemValue);

                        if (CompareHelper.isEvaluable(this.compareEngine.leftValue) && CompareHelper.isArray(this.compareEngine.leftValue)) {
                            supervisor.updateInitialValue(this.compareEngine.leftValue.at(index) as DATA_TYPE[]);
                            //console.log("-- item initial itemValue", this.compareEngine.leftValue.at(index));
                        }
                        //console.log("-- item has change ?", supervisor.hasChange());
                        //console.log("-- item has change ?", supervisor.compareEngine);

                        this.supervisors.push(supervisor);
                    }
                })
            }
        }

        //console.log('-- Supervisors :', this.supervisors.map(supervisor => supervisor.constructor.name))
    }
}