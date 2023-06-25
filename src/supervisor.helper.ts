import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormArraySupervisor} from "./form-array-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";
import {FormSupervisor} from "./form-supervisor.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";
import {
    ControlValueType,
    FormArrayControlItemType,
    FormArrayGroupItemType,
    FormArrayItemType,
    FormGroupInterface,
    FormItemInterface,
    GetMyClassT,
    ValueFormNullable,
    ValueRecordForm
} from "./form.type.js";
import {CompareHelper, ValueKey} from "@alkemist/compare-engine";

export abstract class SupervisorHelper {
    static factory<
        DATA_TYPE extends ValueFormNullable,
    >(
        control: AbstractControl,
        determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined,
        itemType?: FormArrayItemType<DATA_TYPE>
    ): FormSupervisor<DATA_TYPE> {
        type DataType = ControlValueType<typeof control>;
        let supervisor;

        if (control instanceof FormArray) {
            supervisor = new FormArraySupervisor<DataType>(control as FormArray<DataType>, determineArrayIndexFn, itemType);
        } else if (control instanceof FormGroup) {
            supervisor = new FormGroupSupervisor<DataType>(control as FormGroup<DataType>, determineArrayIndexFn, itemType);
        } else {
            supervisor = new FormControlSupervisor<DataType>(control as FormControl<DataType>, determineArrayIndexFn);
        }

        return supervisor;
    }

    static extractFormGroupInterface<
        DATA_TYPE extends ValueFormNullable,
        FORM_TYPE extends FormControl | FormGroup = FormItemInterface<DATA_TYPE>
    >(array: FormArray<FORM_TYPE>): FormArrayItemType<DATA_TYPE> {
        const controls: FORM_TYPE[] = array.controls as FORM_TYPE[];
        if (controls.length === 0) {
            throw new Error("Impossible to determine children type")
        }

        return SupervisorHelper.extractFormGroupItemInterface<DATA_TYPE, FORM_TYPE>(controls[0]);
    }

    static extractFormGroupItemsInterface<DATA_TYPE extends ValueRecordForm>(
        group: FormGroup
    ): FormArrayGroupItemType<DATA_TYPE> {
        const controls = group.controls as Record<keyof DATA_TYPE, AbstractControl>;
        const properties = Object.keys(controls) as (keyof DATA_TYPE)[];

        return properties.reduce((formGroupInterface: FormArrayGroupItemType<DATA_TYPE>, property: keyof DATA_TYPE) => {
            const control = controls[property] as AbstractControl;
            type DataType = ControlValueType<typeof control>;

            formGroupInterface[property] = SupervisorHelper.extractFormGroupItemInterface<DataType, AbstractControl>(control) as
                FormArrayGroupItemType<DATA_TYPE>[keyof DATA_TYPE];
            return formGroupInterface;
        }, {} as FormArrayGroupItemType<DATA_TYPE>);
    }

    static extractFormGroupItemInterface<DATA_TYPE extends ValueFormNullable, FORM_TYPE extends AbstractControl>(
        control: FORM_TYPE
    ): FormArrayItemType<DATA_TYPE> {
        type DataType = ControlValueType<typeof control>;
        return {
            interface: (control instanceof FormGroup
                ? SupervisorHelper.extractFormGroupItemsInterface<DataType>(control as FormGroup)
                : 'control' as FormArrayControlItemType),
            validator: control.validator
        } as FormArrayItemType<DATA_TYPE>
    }

    static factoryItem<DATA_TYPE extends ValueFormNullable, FORM_TYPE extends FormItemInterface<DATA_TYPE>>(
        itemInterface: FormArrayItemType<DATA_TYPE>,
        itemValue: DATA_TYPE
    ): FORM_TYPE {
        if (itemInterface.interface !== 'control') {
            if (!itemValue || !CompareHelper.isRecord(itemValue)) {
                throw new Error("Impossible to build group form")
            }

            type DataType = GetMyClassT<typeof itemInterface.interface>;
            return SupervisorHelper.factoryGroupItem<DataType>(
                itemInterface.interface,
                itemInterface.validator,
                itemValue as DataType
            ) as FormItemInterface<DataType> as FORM_TYPE;
        }
        return new FormControl<DATA_TYPE | null>(itemValue, itemInterface.validator) as FORM_TYPE;
    }

    static factoryGroupItem<DATA_TYPE extends ValueRecordForm>(
        itemInterface: FormArrayGroupItemType<DATA_TYPE>,
        validator: () => {},
        itemValue: DATA_TYPE,
    ): FormGroup<FormGroupInterface<DATA_TYPE>> {
        const properties = Object.keys(itemInterface) as (keyof DATA_TYPE)[];

        const formInterface = properties.reduce(
            (
                formGroupInterface: FormGroupInterface<DATA_TYPE>,
                property: keyof DATA_TYPE
            ) => {
                type subItemType = DATA_TYPE[keyof DATA_TYPE];

                formGroupInterface[property] =
                    SupervisorHelper.factoryItem<subItemType, FormItemInterface<subItemType>>(
                        itemInterface[property],
                        itemValue[property]
                    )
                return formGroupInterface;
            }, {} as FormGroupInterface<DATA_TYPE>);

        return new FormGroup<FormGroupInterface<DATA_TYPE>>(formInterface, validator);
    }

    static extractValidators(control: AbstractControl) {
        return control.validator
    }
}