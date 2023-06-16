import {FormControl} from "@angular/forms";
import {CompareEngine, ValueRecord} from "@alkemist/compare-engine";
import {ValueForm} from "./form.interface.js";

export class SmartFormControl<T extends ValueForm> extends FormControl {
    compareEngine = new CompareEngine();

    /*constructor(value: T, validatorOrOpts?: ValidatorFn | ValidatorFn[] | null, asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
        super(value, validatorOrOpts);
        //this.setValidators(validatorOrOpts)
        this.updateInitialValue(this.value as ValueRecord);
    }*/

    /*new<T = any>(value: FormControlState<T> | T, opts: FormControlOptions & {
        nonNullable: true;
    }): FormControl<T | null> {
        return new FormControl<T>(value);
    }*/

    updateInitialValue(initialValue: ValueRecord) {
        console.log(initialValue);
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
