/*
export class SmartFormGroup<T extends ValueRecord> extends FormGroup<FormGroupInterface<T>> {
    compareEngine = new CompareEngine();

    constructor(
        controls: FormGroupInterface<T>,
        validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
        asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
    ) {
        super(controls, validatorOrOpts, asyncValidator)
        this.updateInitialValue(this.value as ValueRecord);
    }

    updateInitialValue(initialValue: ValueRecord) {
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
*/