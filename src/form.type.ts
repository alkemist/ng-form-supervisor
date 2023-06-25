import {GenericValueRecord, ValuePrimitive, ValueTree} from "@alkemist/compare-engine";
import {AbstractControl, FormControl, FormGroup} from "@angular/forms";

export type ValueForm = ValuePrimitive | ValueTree | null;

export type ValueFormNullable = ValueForm | null;

export type ValueRecordForm = GenericValueRecord<ValueFormNullable>;

export declare type ControlValueType<T extends AbstractControl> = T extends AbstractControl<any, any> ? T['value'] : never;

export declare type ControlRawValueType<T extends AbstractControl>
    = T extends AbstractControl<any, any> ? (T['setValue'] extends ((v: infer R) => void) ? R : never) : never;

export type GetMyClassT<C extends AbstractControl<ValueFormNullable>> = C extends AbstractControl<infer T extends ValueFormNullable> ? T : ValueFormNullable;

export type FormItemInterface<DATA_TYPE extends ValueFormNullable> = DATA_TYPE extends ValueRecordForm
    ? FormControl<DATA_TYPE | null> | FormGroup<FormGroupInterface<DATA_TYPE>>
    : FormControl<DATA_TYPE | null>

export type FormGroupInterface<DATA_TYPE extends ValueRecordForm> = {
    [K in keyof DATA_TYPE]: FormItemInterface<DATA_TYPE[K]>
}

export type FormArrayControlItemType = 'control';

export type FormArrayGroupItemType<DATA_TYPE extends ValueRecordForm> = {
    [K in keyof DATA_TYPE]: FormArrayItemType<DATA_TYPE[K]>
};

export type FormArrayItemType<DATA_TYPE extends ValueFormNullable> = {
    interface: DATA_TYPE extends ValueRecordForm
        ? FormArrayGroupItemType<DATA_TYPE>
        : FormArrayControlItemType,
    validator: () => {}
}