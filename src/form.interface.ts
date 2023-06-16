import {AbstractControl} from "@angular/forms";
import {ValuePrimitive, ValueRecord, ValueTree} from "@alkemist/compare-engine";

export type ValueForm = ValuePrimitive | ValueTree | null;

export type FormGroupInterface<T extends ValueRecord> = {
    [K in keyof T]: AbstractControl<any>
}

export type FormArrayInterface<T extends ValueForm> = Array<AbstractControl<T>>
