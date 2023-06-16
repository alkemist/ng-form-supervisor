import { AbstractControlOptions, AsyncValidatorFn, FormArray, ValidatorFn } from "@angular/forms";
import { CompareEngine, ValueArray, ValueRecord } from "@alkemist/compare-engine";
import { SmartFormGroup } from "./smart-form-group.model.js";
import { SmartFormControl } from "./smart-form-control.model.js";
import { ValueForm } from "./form.interface.js";
type FormArrayType<T extends ValueRecord | ValueForm> = T extends ValueRecord ? SmartFormGroup<T> : SmartFormControl<T>;
export declare class SmartFormArray<T extends ValueRecord> extends FormArray<FormArrayType<T>> {
    compareEngine: CompareEngine;
    constructor(controls: FormArrayType<T>[], validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null);
    updateInitialValue(initialValue: ValueArray): void;
    hasChange(): boolean;
    restore(options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    updateValueAndValidity(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
}
export {};
//# sourceMappingURL=smart-form-array.model.d.ts.map