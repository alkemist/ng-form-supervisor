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

export type GroupValueType<FORM_GROUP_INTERFACE extends FormGroupInterface<any>, DATA_TYPE>
    = { [K in keyof FORM_GROUP_INTERFACE]: ControlValueType<FORM_GROUP_INTERFACE[K]>; }

export declare type ControlRawValueType<T extends AbstractControl>
    = T extends AbstractControl ? (T['setValue'] extends ((v: infer R) => void) ? R : never) : never;

export type GroupRawValueType<FORM_GROUP_INTERFACE extends FormGroupInterface<any>, DATA_TYPE>
    = { [K in keyof FORM_GROUP_INTERFACE]: ControlRawValueType<FORM_GROUP_INTERFACE[K]>; }

export type RecursivePartial<T> = {
    [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
        T[P] extends object | undefined ? RecursivePartial<T[P]> :
            T[P];
};

export type PartialGroupValueType<FORM_GROUP_INTERFACE extends FormGroupInterface<any>, DATA_TYPE>
    = RecursivePartial<{ [K in keyof FORM_GROUP_INTERFACE]: ControlRawValueType<FORM_GROUP_INTERFACE[K]>; }>

export type FormDataType<
    DATA_TYPE,
    FORM_TYPE extends AbstractControl
> =
    DATA_TYPE | GroupValueType<GetFormGroupGenericClass<FORM_TYPE, DATA_TYPE>, DATA_TYPE>;


export type FormRawDataType<
    DATA_TYPE,
    FORM_TYPE,
> =
    DATA_TYPE
    | GroupRawValueType<GetFormGroupGenericClass<FORM_TYPE, DATA_TYPE>, DATA_TYPE>;

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

export type FormArrayControlItemInterfaceType = 'control';

export type FormArrayGroupInterfaceType<DATA_TYPE, FORM_ARRAY_ITEM_TYPE> = {
    [K in keyof DATA_TYPE]: FormArrayItemConfigurationType<DATA_TYPE[K], FORM_ARRAY_ITEM_TYPE>
};

export type FormArrayItemConfigurationType<DATA_TYPE, FORM_ARRAY_ITEM_TYPE> = {
    interface: FORM_ARRAY_ITEM_TYPE extends FormGroup
        ? FormArrayGroupInterfaceType<DATA_TYPE, FORM_ARRAY_ITEM_TYPE>
        : FORM_ARRAY_ITEM_TYPE extends FormArray
            ? FormArrayItemConfigurationType<DATA_TYPE, FORM_ARRAY_ITEM_TYPE>
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
    DATA_TYPE extends (infer DATA_TYPE_ITEM)[]
        ? FORM_TYPE extends FormArray
            ? GetFormArrayGenericClass<FORM_TYPE> extends FormGroup
                ? FormArrayGroupSupervisor<DATA_TYPE_ITEM, FORM_TYPE>
                : FormArrayControlSupervisor<DATA_TYPE_ITEM>
            : FORM_TYPE extends FormGroup
                ? FormGroupSupervisor<DATA_TYPE_ITEM, FORM_TYPE>
                : FormControlSupervisor<DATA_TYPE_ITEM>
        : FORM_TYPE extends FormArray
            ? GetFormArrayGenericClass<FORM_TYPE> extends FormGroup
                ? FormArrayGroupSupervisor<DATA_TYPE, FORM_TYPE>
                : FormArrayControlSupervisor<DATA_TYPE>
            : FORM_TYPE extends FormGroup
                ? FormGroupSupervisor<DATA_TYPE, FORM_TYPE>
                : DATA_TYPE extends boolean
                    ? FormControlSupervisor<boolean>
                    : FormControlSupervisor<DATA_TYPE>


export type GetFormGroupGenericClass<FORM_GROUP, DATA_TYPE> =
    DATA_TYPE extends (infer DATA_TYPE_ITEM)[]
        ? FORM_GROUP extends FormGroup<infer T>
            ? T
            : never
        : FORM_GROUP extends FormGroup<infer T>
            ? T
            : never;

export type GetFormArrayGenericClass<FORM_GROUP> =
    FORM_GROUP extends FormArray<infer T extends AbstractControl>
        ? T
        : never;