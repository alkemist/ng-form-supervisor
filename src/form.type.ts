import {GenericValueRecord, ValueKey, ValuePrimitive} from "@alkemist/compare-engine";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormArraySupervisor} from "./form-array-supervisor.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";

export type ValueForm = ValuePrimitive | ValueRecordForm | ValueArrayForm;

export type ValueFormNullable = ValueForm | null;

export interface ValueRecordForm {
    [x: ValueKey]: ValueFormNullable;
}

export interface ValueArrayForm extends Array<ValueFormNullable> {
}

export declare type ControlValueType<T extends AbstractForm> = T extends AbstractForm ? T['value'] : never;

/*export declare type ControlRawValueType<T extends AbstractForm>
    = T extends AbstractForm ? (T['setValue'] extends ((v: infer R) => void) ? R : never) : never;*/
export declare type ControlRawValueType<T extends AbstractForm, DATA_TYPE>
    = T extends AbstractForm ? (T['setValue'] extends ((v: infer R extends DATA_TYPE) => void) ? R : never) : never;

export type GetMyClassT<C> = C extends GenericValueRecord<infer T extends ValueFormNullable> ? T : never;

//export type GetMyClassT2<C, D> = C extends GenericValueRecord<infer T extends { [K in keyof D]: D[K] }> ? T : never;
export type GetMyClassT2<C, D> = C extends GenericValueRecord<infer T extends FormGroupInterface<D>> ? T : never;

export type FormDataType<
    DATA_TYPE = ValueFormNullable,
    FORM_TYPE extends AbstractForm = AbstractForm
> = DATA_TYPE | ControlValueType<FORM_TYPE>;

export type FormRowDataType<
    DATA_TYPE = ValueFormNullable,
    FORM_TYPE extends AbstractForm = AbstractForm
> = DATA_TYPE | ControlRawValueType<FORM_TYPE, DATA_TYPE>;

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

export type FormControlType<DATA_TYPE> = DATA_TYPE extends (infer U)[] ? FormControl<U | null> : never

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

export type AbstractArrayItemForm<DATA_TYPE = any> = FormControl<DATA_TYPE> | FormGroup<DATA_TYPE>;
export type AbstractForm<DATA_TYPE = any> = AbstractArrayItemForm<DATA_TYPE> | FormArray<DATA_TYPE>;

export type SupervisorType<
    DATA_TYPE,
    FORM_TYPE,
> =
    FORM_TYPE extends FormArray
        ? FormArraySupervisor<DATA_TYPE>
        : FORM_TYPE extends FormGroup
            ? DATA_TYPE extends ValueRecordForm
                ? FormGroupSupervisor<DATA_TYPE, FORM_TYPE>
                : FormControlSupervisor<DATA_TYPE>
            : FormControlSupervisor<DATA_TYPE>

/*export type SupervisorType<
    DATA_TYPE,
    FORM_TYPE extends FormControl | FormArray | FormGroup,
> =
    FORM_TYPE extends FormArray
        ? FORM_TYPE extends FormGroup
            ? FormArrayGroupSupervisor<DATA_TYPE>
            : FormArrayControlSupervisor<DATA_TYPE>
        : FORM_TYPE extends FormGroup
            ? DATA_TYPE extends ValueRecordForm
                ? FormGroupSupervisor<DATA_TYPE>
                : FormControlSupervisor<DATA_TYPE>
            : FormControlSupervisor<DATA_TYPE>*/