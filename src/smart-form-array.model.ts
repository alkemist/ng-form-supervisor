import {AbstractControlOptions, AsyncValidatorFn, FormArray, ValidatorFn} from "@angular/forms";
import {CompareEngine, ValueArray, ValueRecord} from "@alkemist/compare-engine";
import {SmartFormGroup} from "./smart-form-group.model.js";
import {SmartFormControl} from "./smart-form-control.model.js";
import {ValueForm} from "./form.interface.js";

type FormArrayType<T extends ValueRecord | ValueForm> = T extends ValueRecord
    ? SmartFormGroup<T>
    : SmartFormControl<T>;

export class SmartFormArray<T extends ValueRecord> extends FormArray<FormArrayType<T>> {
    compareEngine = new CompareEngine();

    constructor(
        controls: FormArrayType<T>[],
        validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
        asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
    ) {
        super(controls, validatorOrOpts, asyncValidator)
        this.updateInitialValue(this.value as ValueArray);
    }

    updateInitialValue(initialValue: ValueArray) {
        this.compareEngine.updateLeft(initialValue);
        this.compareEngine.updateRight(initialValue);
        this.compareEngine.updateCompareIndex();
    }

    hasChange(): boolean {
        return this.compareEngine.hasChange();
    }

    restore(options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }) {
        this.setValue(this.compareEngine.leftValue as any, options);
        this.compareEngine.leftToRight();
        this.compareEngine.updateCompareIndex();
    }

    override updateValueAndValidity(opts?: { onlySelf?: boolean; emitEvent?: boolean }) {
        super.updateValueAndValidity(opts);
        if (this.compareEngine) {
            this.compareEngine.updateRight(this.value);
            this.compareEngine.updateCompareIndex();
        }
    }
}
