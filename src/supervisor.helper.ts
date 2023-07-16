import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormArrayControlSupervisor, FormArrayGroupSupervisor} from "./form-array-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";
import {
    AbstractForm,
    ControlValueType,
    FormArrayGroupInterfaceType,
    FormArrayItemInterfaceType,
    FormArrayItemType,
    FormGroupInterface,
    isValueRecordForm,
    SupervisorType,
    ValueFormNullable,
    ValueRecordForm
} from "./form.type.js";
import {CompareHelper, ValueKey} from "@alkemist/compare-engine";

export abstract class SupervisorHelper {
    static factory<
        DATA_TYPE,
        FORM_TYPE extends FormArray | FormGroup | FormControl,
        SUPERVISOR_TYPE = SupervisorType<DATA_TYPE, FORM_TYPE>
    >(
        control: FORM_TYPE,
        determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined,
        itemType?: FormArrayItemInterfaceType<DATA_TYPE>,
        showLog = false,
    ): SUPERVISOR_TYPE {
        type DataType = ControlValueType<typeof control>;
        let supervisor;

        if (control instanceof FormArray) {
            if (control.at(0) instanceof FormGroup) {
                supervisor = new FormArrayGroupSupervisor<DATA_TYPE>(
                    control as FormArray,
                    determineArrayIndexFn,
                    itemType as FormArrayItemInterfaceType<ControlValueType<FORM_TYPE>>,
                    showLog
                );
            } else {
                supervisor = new FormArrayControlSupervisor<DATA_TYPE>(
                    control as FormArray,
                    determineArrayIndexFn,
                    itemType as FormArrayItemInterfaceType<ControlValueType<FORM_TYPE>>,
                    showLog
                );
            }
        } else if (control instanceof FormGroup) {
            supervisor = new FormGroupSupervisor<DataType, typeof control>(
                control,
                control.value,
                determineArrayIndexFn,
            );
        } else {
            supervisor = new FormControlSupervisor<DataType>(
                control as FormControl<DataType>,
                determineArrayIndexFn,
            );
        }

        return supervisor as SUPERVISOR_TYPE;
    }

    static extractFormGroupInterface<
        DATA_TYPE,
        FORM_TYPE extends FormControl | FormGroup = FormArrayItemType<DATA_TYPE>,
    >(array: FormArray<FORM_TYPE>): FormArrayItemInterfaceType<DATA_TYPE> {
        const controls: FORM_TYPE[] = array.controls as FORM_TYPE[];
        if (controls.length === 0) {
            throw new Error("Impossible to determine children type")
        }

        return SupervisorHelper.extractFormGroupItemInterface<DATA_TYPE, FORM_TYPE>(controls[0]);
    }

    static extractFormGroupItemsInterface<DATA_TYPE extends ValueRecordForm>(
        group: FormGroup
    ): FormArrayGroupInterfaceType<DATA_TYPE> {
        const controls = group.controls as Record<keyof DATA_TYPE, AbstractForm>;
        const properties = Object.keys(controls) as (keyof DATA_TYPE)[];

        return properties.reduce((formGroupInterface: FormArrayGroupInterfaceType<DATA_TYPE>, property: keyof DATA_TYPE) => {
            const control = controls[property] as AbstractForm;
            type DataType = ControlValueType<typeof control>;

            formGroupInterface[property] = SupervisorHelper.extractFormGroupItemInterface<DataType, typeof control>(control) as
                FormArrayGroupInterfaceType<DATA_TYPE>[keyof DATA_TYPE];
            return formGroupInterface;
        }, {} as FormArrayGroupInterfaceType<DATA_TYPE>);
    }

    static extractFormGroupItemInterface<
        DATA_TYPE,
        FORM_TYPE extends AbstractControl
    >(control: FORM_TYPE): FormArrayItemInterfaceType<DATA_TYPE> {
        type DataType = ControlValueType<typeof control>;
        const itemInterface = control instanceof FormGroup
            ? SupervisorHelper.extractFormGroupItemsInterface<DataType>(control as FormGroup)
            : 'control'
        return {
            interface: itemInterface,
            validator: control.validator
        } as FormArrayItemInterfaceType<DATA_TYPE>
    }

    static factoryItem<
        DATA_TYPE,
        FORM_TYPE extends FormGroup | FormControl
    >(
        itemInterface: FormArrayItemInterfaceType<DATA_TYPE>,
        itemValue: DATA_TYPE
    ): FORM_TYPE {
        if (CompareHelper.isRecord<ValueFormNullable>(itemValue)
            && CompareHelper.isRecord<isValueRecordForm<DATA_TYPE>>(itemInterface.interface)) {
            return SupervisorHelper.factoryGroupItem<isValueRecordForm<DATA_TYPE>>(
                itemInterface.interface as FormArrayGroupInterfaceType<isValueRecordForm<DATA_TYPE>>,
                itemInterface.validator,
                itemValue as isValueRecordForm<DATA_TYPE>
            ) as FORM_TYPE;
        }
        return new FormControl<DATA_TYPE | null>(itemValue, itemInterface.validator) as FORM_TYPE;
    }

    static factoryGroupItem<DATA_TYPE extends ValueRecordForm>(
        itemInterface: FormArrayGroupInterfaceType<DATA_TYPE>,
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
                    SupervisorHelper.factoryItem<subItemType, FormArrayItemType<subItemType>>(
                        itemInterface[property],
                        itemValue[property]
                    )
                return formGroupInterface;
            }, {} as FormGroupInterface<DATA_TYPE>);

        return new FormGroup<FormGroupInterface<DATA_TYPE>>(formInterface, validator);
    }
}