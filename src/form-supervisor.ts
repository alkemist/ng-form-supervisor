import {AbstractControl} from "@angular/forms";
import {CompareEngine, ValueKey} from "@alkemist/compare-engine";
import {Observable, Subscription} from "rxjs";
import {ControlRawValueType, ControlValueType, ValueForm} from "./form.type.js";
import {FormOptions} from "./form.interface.js";

export abstract class FormSupervisor<
    DATA_TYPE extends ValueForm = ValueForm,
    FORM_TYPE extends AbstractControl = AbstractControl
> {
    sub: Subscription = new Subscription();

    compareEngine: CompareEngine<DATA_TYPE | ControlValueType<FORM_TYPE>>;
    destructor: FinalizationRegistry<FormSupervisor<DATA_TYPE, FORM_TYPE>>;

    protected constructor(determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined) {
        this.compareEngine = new CompareEngine<DATA_TYPE | ControlValueType<FORM_TYPE>>(determineArrayIndexFn)

        this.destructor = new FinalizationRegistry(() => {
            this.sub.unsubscribe();
        });
    }

    abstract get valid(): boolean;

    abstract get value(): DATA_TYPE | ControlValueType<FORM_TYPE>;

    abstract get valueChanges(): Observable<DATA_TYPE | ControlValueType<FORM_TYPE>>;

    abstract setValue(value: DATA_TYPE | ControlRawValueType<FORM_TYPE> | undefined, options?: FormOptions): void;

    abstract reset(options?: FormOptions): void;

    updateInitialValue(value?: DATA_TYPE | ControlRawValueType<FORM_TYPE>) {
        if (value) {
            this.compareEngine.updateLeft(value);
        } else {
            this.compareEngine.updateLeft(this.value);
            this.compareEngine.updateRight(this.value);
        }

        this.compareEngine.updateCompareIndex();
    }

    hasChange(): boolean {
        return this.compareEngine.hasChange();
    }

    restore(options?: FormOptions) {
        this.setValue(this.compareEngine.leftValue, options);
        this.compareEngine.leftToRight();
        this.compareEngine.updateCompareIndex();
    }

    protected onChange(value: DATA_TYPE | ControlValueType<FORM_TYPE>) {
        this.compareEngine.updateRight(value);
        this.compareEngine.updateCompareIndex();
    }
}