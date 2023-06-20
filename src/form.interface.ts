import {AbstractControl, FormControl} from "@angular/forms";
import {ValuePrimitive, ValueTree} from "@alkemist/compare-engine";

export type ValueForm = ValuePrimitive | ValueTree | null;

export declare type RawValue<T extends AbstractControl>
    = T extends AbstractControl<any, any> ? (T['setValue'] extends ((v: infer R) => void) ? R : never) : never;

export declare type Value<T extends AbstractControl> = T extends AbstractControl<any, any> ? T['value'] : never;

export type FormGroupInterface<T> = {
    [K in keyof T]: FormControl<T[K] | null>
}

export type FormArrayInterface<
    DATE_TYPE extends ValueForm,
    FORM_TYPE extends AbstractControl<DATE_TYPE>
>
    = Array<FORM_TYPE>