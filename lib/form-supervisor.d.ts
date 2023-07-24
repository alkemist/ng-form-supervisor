import { CompareEngine, GenericValueRecord, ValueKey } from "@alkemist/compare-engine";
import { Observable, Subscription } from "rxjs";
import { FormChange, FormDataType, FormRawDataType } from "./form.type.js";
import { FormOptions } from "./form.interface.js";
import { AbstractControl } from "@angular/forms";
import { CompareState } from "@alkemist/compare-engine/lib/compare-state.js";
export declare abstract class FormSupervisor<DATA_TYPE = any, FORM_TYPE extends AbstractControl = AbstractControl> {
    protected determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined;
    protected parentSupervisor?: FormSupervisor<any, AbstractControl<any, any>> | undefined;
    protected showLog: boolean;
    protected compareEngine: CompareEngine<FormRawDataType<DATA_TYPE, FORM_TYPE>>;
    protected sub: Subscription;
    private destructor;
    protected constructor(determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined, parentSupervisor?: FormSupervisor<any, AbstractControl<any, any>> | undefined);
    abstract get form(): FORM_TYPE;
    abstract get valid(): boolean;
    abstract get value(): FormDataType<DATA_TYPE, FORM_TYPE> | undefined;
    abstract get valueChanges(): Observable<FormDataType<DATA_TYPE, FORM_TYPE>>;
    abstract setValue(value: FormRawDataType<DATA_TYPE, FORM_TYPE> | undefined, options?: FormOptions): void;
    abstract reset(options: FormOptions | undefined): void;
    update(): void;
    updateInitialValue(value: FormRawDataType<DATA_TYPE, FORM_TYPE>): void;
    resetInitialValue(): void;
    hasChange(): boolean;
    restore(options?: FormOptions): void;
    enableLog(): void;
    disableLog(): void;
    onChange(value?: FormDataType<DATA_TYPE, FORM_TYPE> | FormRawDataType<DATA_TYPE, FORM_TYPE> | undefined): void;
    getChanges(): CompareState | GenericValueRecord<FormChange> | FormChange[];
    patchValue(value: FormRawDataType<DATA_TYPE, FORM_TYPE> | undefined, options?: FormOptions): void;
    checkOptions(options?: FormOptions): void;
}
//# sourceMappingURL=form-supervisor.d.ts.map