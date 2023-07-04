import {ValueKey, ValuePrimitive} from "@alkemist/compare-engine";
import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormArrayControlSupervisor, FormArrayGroupSupervisor} from "./form-array-supervisor.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";

export type ValueForm = ValuePrimitive | ValueRecordForm | ValueArrayForm;

export type ValueFormNullable = ValueForm | null;

export interface ValueRecordForm {
    [x: ValueKey]: ValueFormNullable;
}

export interface ValueArrayForm extends Array<ValueFormNullable> {
}

export declare type ControlValueType<T extends AbstractControl> = T extends AbstractForm ? T['value'] : never;

export type GroupValueType<FORM_GROUP_INTERFACE extends FormGroupInterface<DATA_TYPE>, DATA_TYPE>
    = { [K in keyof FORM_GROUP_INTERFACE]: ControlValueType<FORM_GROUP_INTERFACE[K]>; }

export declare type ControlRawValueType<T extends AbstractControl>
    = T extends AbstractControl ? (T['setValue'] extends ((v: infer R) => void) ? R : never) : never;

export type GroupRawValueType<FORM_GROUP_INTERFACE extends FormGroupInterface<DATA_TYPE>, DATA_TYPE>
    = { [K in keyof FORM_GROUP_INTERFACE]: ControlRawValueType<FORM_GROUP_INTERFACE[K]>; }

export type GroupRawValueType2<FORM_GROUP extends FormGroup<FormGroupGeneric<DATA_TYPE>>, DATA_TYPE>
    = { [K in keyof DATA_TYPE]: ControlRawValueType<GetFormGroupGenericClass<FORM_GROUP, DATA_TYPE>[K]>; }

export type FormDataType<
    DATA_TYPE = ValueFormNullable,
    FORM_TYPE extends AbstractControl = AbstractControl
> =
    DATA_TYPE
    | GroupValueType<FormGroupInterface<DATA_TYPE>, DATA_TYPE>;

export type FormRawDataType<
    DATA_TYPE = ValueFormNullable,
    FORM_TYPE extends AbstractControl = AbstractControl,
> =
    DATA_TYPE
    | GroupRawValueType<FormGroupInterface<DATA_TYPE>, DATA_TYPE>;

export type ArrayType<T> = T extends (infer U)[] ? U : never;
export type isValueRecordForm<T> = T extends ValueRecordForm ? T : never;

export type FormArrayItemType<DATA_TYPE> =
    DATA_TYPE extends ValueRecordForm
        ? FormControl<DATA_TYPE | null> | FormGroup<FormGroupInterface<DATA_TYPE>>
        : DATA_TYPE extends boolean
            ? FormControl<boolean | null>
            : DATA_TYPE extends string
                ? FormControl<string | null>
                : FormControl<DATA_TYPE | null>;

export type FormGroupInterface<DATA_TYPE> = {
    [K in keyof DATA_TYPE]: ArrayType<DATA_TYPE[K]> extends ValueRecordForm
        ? FormArrayItemType<DATA_TYPE[K]> | FormArray<FormControl<ArrayType<DATA_TYPE[K]> | null>> | FormArray<FormGroup<FormGroupInterface<ArrayType<DATA_TYPE[K]>>>>
        : FormArrayItemType<DATA_TYPE[K]> | FormArray<FormControl<ArrayType<DATA_TYPE[K]> | null>>
};

export type FormGroupGeneric<DATA_TYPE> = {
    [K in keyof DATA_TYPE]: any
};

export type FormArrayControlItemInterfaceType = 'control';

export type FormArrayGroupInterfaceType<DATA_TYPE> = {
    [K in keyof DATA_TYPE]: FormArrayItemInterfaceType<DATA_TYPE[K]>
};

export type FormArrayItemInterfaceType<DATA_TYPE> = {
    interface: DATA_TYPE extends ValueRecordForm
        ? FormArrayGroupInterfaceType<DATA_TYPE>
        : FormArrayControlItemInterfaceType,
    validator: () => {}
};

export type AbstractArrayItemForm<DATA_TYPE = any> = FormControl<DATA_TYPE> | FormGroup<FormGroupInterface<DATA_TYPE>>;
export type AbstractForm<DATA_TYPE = any> =
    AbstractArrayItemForm<DATA_TYPE>
    | FormArray<AbstractArrayItemForm<DATA_TYPE>>;

export type SupervisorType<
    DATA_TYPE,
    FORM_TYPE,
> =
    FORM_TYPE extends FormArray
        ? ControlValueType<FORM_TYPE> extends FormGroup
            ? FormArrayGroupSupervisor<DATA_TYPE>
            : FormArrayControlSupervisor<DATA_TYPE>
        : FORM_TYPE extends FormGroup
            ? DATA_TYPE extends ValueRecordForm
                ? FormGroupSupervisor<DATA_TYPE, FORM_TYPE>
                : FormControlSupervisor<DATA_TYPE>
            : FormControlSupervisor<DATA_TYPE>

export type GetFormGroupGenericClass<C, DATA_TYPE> =
    C extends FormGroup<infer T extends FormGroupInterface<DATA_TYPE>> ? T : never;