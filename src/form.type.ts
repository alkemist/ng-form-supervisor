import {GenericValueRecord, ValuePrimitive, ValueTree} from "@alkemist/compare-engine";
import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormSupervisor} from "./form-supervisor.js";

export type ValueForm = ValuePrimitive | ValueTree | null;

export declare type ControlRawValueType<T extends AbstractControl>
    = T extends AbstractControl<any, any> ? (T['setValue'] extends ((v: infer R) => void) ? R : never) : never;

export declare type ControlValueType<T extends AbstractControl> = T extends AbstractControl<any, any> ? T['value'] : never;

export type FormGroupInterface<T extends GenericValueRecord<ValueForm>> = {
    [K in keyof T]: FormControl<T[K] | null>
}

export type GetMyClassT<C extends AbstractControl<ValueForm>> = C extends AbstractControl<infer T extends ValueForm> ? T : ValueForm;

export type ValueRecordForm = GenericValueRecord<ValueForm>;

export type SupervisorRecord<DATA_TYPE extends ValueForm> = {
    [K in keyof DATA_TYPE]: FormSupervisor<DATA_TYPE[K]>
}

export type FormArrayType<DATA_TYPE extends ValueForm> = DATA_TYPE extends ValueRecordForm
    ? FormArray<FormGroup<FormGroupInterface<DATA_TYPE>>>
    : FormArray<FormControl<DATA_TYPE | null>>;