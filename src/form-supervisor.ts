import {CompareEngine, ValueKey} from "@alkemist/compare-engine";
import {Observable, Subscription} from "rxjs";
import {AbstractForm, ControlValueType, FormDataType, FormRowDataType, ValueFormNullable} from "./form.type.js";
import {FormOptions} from "./form.interface.js";

export abstract class FormSupervisor<
    DATA_TYPE = ValueFormNullable,
    FORM_TYPE extends AbstractForm = AbstractForm
> {
    public compareEngine: CompareEngine<FormDataType<DATA_TYPE, FORM_TYPE>>;
    protected sub: Subscription = new Subscription();
    private destructor: FinalizationRegistry<FormSupervisor<DATA_TYPE, FORM_TYPE>>;

    protected constructor(protected determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey)) {
        this.compareEngine = new CompareEngine<DATA_TYPE | ControlValueType<FORM_TYPE>>(determineArrayIndexFn)

        this.destructor = new FinalizationRegistry(() => {
            this.sub.unsubscribe();
        });
    }

    abstract get form(): FORM_TYPE;

    abstract get valid(): boolean;

    abstract get value(): FormDataType<DATA_TYPE, FORM_TYPE> | undefined;

    abstract get valueChanges(): Observable<FormDataType<DATA_TYPE, FORM_TYPE>>;

    abstract setValue(value: FormRowDataType<DATA_TYPE, FORM_TYPE> | undefined, options?: FormOptions): void;

    // @TODO
    //abstract patchValue(value: DATA_TYPE | ControlRawValueType<FORM_TYPE> | undefined, options?: FormOptions): void;

    abstract reset(options?: FormOptions): void;

    updateInitialValue(value?: FormRowDataType<DATA_TYPE, FORM_TYPE>) {
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
    }

    protected onChange(value: FormDataType<DATA_TYPE, FORM_TYPE> | undefined) {
        this.compareEngine.updateRight(value);
        this.compareEngine.updateCompareIndex();
    }
}