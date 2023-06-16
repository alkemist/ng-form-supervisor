import { AbstractControlOptions, AsyncValidatorFn, FormGroup, ValidatorFn } from "@angular/forms";
import { CompareEngine, ValueRecord } from "@alkemist/compare-engine";
import { FormGroupInterface } from "./form.interface.js";
export declare class SmartFormGroup<T extends ValueRecord> extends FormGroup<FormGroupInterface<T>> {
    compareEngine: CompareEngine;
    constructor(controls: FormGroupInterface<T>, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null);
    updateInitialValue(initialValue: ValueRecord): void;
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
//# sourceMappingURL=smart-form-group.model.d.ts.map