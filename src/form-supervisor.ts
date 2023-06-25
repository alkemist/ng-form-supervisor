import {AbstractControl} from "@angular/forms";
import {CompareEngine, ValueKey} from "@alkemist/compare-engine";
import {Observable, Subscription} from "rxjs";
import {ControlRawValueType, ControlValueType, ValueFormNullable} from "./form.type.js";
import {FormOptions} from "./form.interface.js";

export abstract class FormSupervisor<
    DATA_TYPE extends ValueFormNullable = ValueFormNullable,
    FORM_TYPE extends AbstractControl = AbstractControl
> {
    protected sub: Subscription = new Subscription();

    protected compareEngine: CompareEngine<DATA_TYPE | ControlValueType<FORM_TYPE>>;

    private destructor: FinalizationRegistry<FormSupervisor<DATA_TYPE, FORM_TYPE>>;

    protected constructor(protected determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey)) {
        this.compareEngine = new CompareEngine<DATA_TYPE | ControlValueType<FORM_TYPE>>(determineArrayIndexFn)

        this.destructor = new FinalizationRegistry(() => {
            this.sub.unsubscribe();
        });
    }

    abstract get valid(): boolean;

    abstract get value(): DATA_TYPE | ControlValueType<FORM_TYPE> | undefined;

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

    protected onChange(value: DATA_TYPE | ControlValueType<FORM_TYPE> | undefined) {
        this.compareEngine.updateRight(value);
        this.compareEngine.updateCompareIndex();
    }
}