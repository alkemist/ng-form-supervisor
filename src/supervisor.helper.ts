import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormArrayControlSupervisor, FormArrayGroupSupervisor} from "./form-array-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";
import {
    AbstractForm,
    ArrayType,
    ControlValueType,
    FormArrayGroupInterfaceType,
    FormArrayItemConfigurationType,
    FormArrayItemType,
    FormGroupInterface,
    GetFormArrayGenericClass,
    isValueRecordForm,
    ValueFormNullable,
    ValueRecordForm
} from "./form.type.js";
import {CompareHelper, ValueKey} from "@alkemist/compare-engine";

export abstract class SupervisorHelper {
    static factory<
        DATA_TYPE,
        FORM_TYPE extends FormArray | FormGroup | FormControl,
        SUPERVISOR_TYPE
    >(
        control: FORM_TYPE,
        determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined,
        itemType?: FormArrayItemConfigurationType<DATA_TYPE, FORM_TYPE>,
    ): SUPERVISOR_TYPE {
        type DataType = ControlValueType<typeof control>;
        let supervisor;

        if (control instanceof FormArray) {
            if (control.at(0) instanceof FormGroup) {
                supervisor = new FormArrayGroupSupervisor<DATA_TYPE, typeof control>(
                    control,
                    control.value,
                    determineArrayIndexFn,
                    itemType as FormArrayItemConfigurationType<ControlValueType<FORM_TYPE>, FormGroup>
                );
            } else {
                supervisor = new FormArrayControlSupervisor<DATA_TYPE>(
                    control,
                    determineArrayIndexFn,
                    itemType as FormArrayItemConfigurationType<ControlValueType<FORM_TYPE>, FormControl>
                );
            }
        } else if (control instanceof FormGroup) {
            supervisor = new FormGroupSupervisor<DataType, typeof control>(
                control,
                control.value,
                determineArrayIndexFn,
                itemType as FormArrayItemConfigurationType<ControlValueType<FORM_TYPE>, FormGroup>
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
        FORM_TYPE extends FormControl | FormGroup,
    >(array: FormArray<FORM_TYPE>): FormArrayItemConfigurationType<DATA_TYPE, FORM_TYPE> {
        const controls: FORM_TYPE[] = array.controls as FORM_TYPE[];
        if (controls.length === 0) {
            console.error("Impossible to determine children type");
            throw new Error("Impossible to determine children type")
        }

        return SupervisorHelper.extractFormGroupItemInterface<DATA_TYPE, FORM_TYPE>(controls[0]);
    }

    static extractFormGroupItemsInterface<DATA_TYPE extends ValueRecordForm>(
        group: FormGroup
    ): FormArrayGroupInterfaceType<DATA_TYPE, FormGroup> {
        const controls = group.controls as Record<keyof DATA_TYPE, AbstractForm>;
        const properties = CompareHelper.keys(controls) as (keyof DATA_TYPE)[];

        return properties.reduce((formGroupInterface: FormArrayGroupInterfaceType<DATA_TYPE, FormGroup>, property: keyof DATA_TYPE) => {
            const control = controls[property] as AbstractForm;
            type DataType = ControlValueType<typeof control>;

            formGroupInterface[property] = SupervisorHelper.extractFormGroupItemInterface<DataType, typeof control>(control) as
                FormArrayGroupInterfaceType<DATA_TYPE, FormGroup>[keyof DATA_TYPE];
            return formGroupInterface;
        }, {} as FormArrayGroupInterfaceType<DATA_TYPE, FormGroup>);
    }

    static extractFormGroupItemInterface<
        DATA_TYPE,
        FORM_TYPE extends AbstractControl
    >(control: FORM_TYPE): FormArrayItemConfigurationType<DATA_TYPE, FORM_TYPE> {
        type DataType = ControlValueType<typeof control>;
        const itemInterface = control instanceof FormGroup
            ? SupervisorHelper.extractFormGroupItemsInterface<DataType>(control as FormGroup)
            : control instanceof FormArray
                ? SupervisorHelper.extractFormGroupInterface<DATA_TYPE, GetFormArrayGenericClass<typeof control>>(control)
                : 'control'
        return {
            interface: itemInterface,
            validator: control.validator
        } as FormArrayItemConfigurationType<DATA_TYPE, FORM_TYPE>
    }

    static factoryItem<
        DATA_TYPE,
        FORM_ARRAY_ITEM_TYPE extends FormGroup | FormControl | FormArray,
    >(
        itemInterface: FormArrayItemConfigurationType<DATA_TYPE, FORM_ARRAY_ITEM_TYPE>,
        itemValue: DATA_TYPE
    ): FORM_ARRAY_ITEM_TYPE {
        if (
            CompareHelper.isRecord<ValueFormNullable>(itemValue)
            && CompareHelper.isRecord<isValueRecordForm<DATA_TYPE>>(itemInterface.interface)
        ) {
            return SupervisorHelper.factoryArrayGroupItem<isValueRecordForm<DATA_TYPE>>(
                itemInterface.interface as FormArrayGroupInterfaceType<isValueRecordForm<DATA_TYPE>, FORM_ARRAY_ITEM_TYPE>,
                itemInterface.validator,
                itemValue as isValueRecordForm<DATA_TYPE>
            ) as FORM_ARRAY_ITEM_TYPE;
        } else if (
            CompareHelper.isArray<ValueFormNullable>(itemValue)
            && itemInterface.interface !== 'control'
        ) {
            type dataSubItemType = ArrayType<DATA_TYPE>;
            type controlSubItemType = FormArrayItemType<DATA_TYPE>;

            return new FormArray(
                itemValue.map(subItemValue =>
                    SupervisorHelper.factoryItem(
                        itemInterface.interface as FormArrayItemConfigurationType<dataSubItemType, controlSubItemType>,
                        subItemValue as dataSubItemType
                    )
                ),
                itemInterface.validator
            ) as FORM_ARRAY_ITEM_TYPE;
        } else {
            return new FormControl<DATA_TYPE | null>(itemValue, itemInterface.validator) as FORM_ARRAY_ITEM_TYPE;
        }
    }

    static factoryArrayGroupItem<
        DATA_TYPE extends ValueRecordForm
    >(
        itemInterface: FormArrayGroupInterfaceType<DATA_TYPE, FormGroup>,
        validator: () => {},
        itemValue: DATA_TYPE,
    ): FormGroup<FormGroupInterface<DATA_TYPE>> {
        const properties = CompareHelper.keys(itemInterface) as (keyof DATA_TYPE)[];

        const formInterface = properties.reduce(
            (
                formGroupInterface: FormGroupInterface<DATA_TYPE>,
                property: keyof DATA_TYPE
            ) => {
                type subItemType = DATA_TYPE[keyof DATA_TYPE];

                formGroupInterface[property] =
                    SupervisorHelper.factoryItem(
                        itemInterface[property] as FormArrayItemConfigurationType<subItemType, FormArrayItemType<subItemType>>,
                        itemValue[property]
                    )
                return formGroupInterface;
            }, {} as FormGroupInterface<DATA_TYPE>);

        return new FormGroup<FormGroupInterface<DATA_TYPE>>(formInterface, validator);
    }
}