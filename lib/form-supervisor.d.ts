import { CompareEngine, ValueKey } from "@alkemist/compare-engine";
import { Observable, Subscription } from "rxjs";
import { FormDataType, FormRawDataType, GetFormGroupGenericClass, PartialGroupValueType } from "./form.type.js";
import { FormOptions } from "./form.interface.js";
import { AbstractControl } from "@angular/forms";
export declare abstract class FormSupervisor<DATA_TYPE = any, FORM_TYPE extends AbstractControl = AbstractControl> {
    protected determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined;
    protected showLog: boolean;
    protected compareEngine: CompareEngine<FormRawDataType<DATA_TYPE, FORM_TYPE> | PartialGroupValueType<GetFormGroupGenericClass<FORM_TYPE, DATA_TYPE>, DATA_TYPE>>;
    protected sub: Subscription;
    private destructor;
    protected constructor(determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined);
    abstract get form(): FORM_TYPE;
    abstract get valid(): boolean;
    abstract get value(): FormDataType<DATA_TYPE, FORM_TYPE> | undefined;
    abstract get valueChanges(): Observable<FormDataType<DATA_TYPE, FORM_TYPE>>;
    abstract setValue(value: FormRawDataType<DATA_TYPE, FORM_TYPE> | PartialGroupValueType<GetFormGroupGenericClass<FORM_TYPE, DATA_TYPE>, DATA_TYPE> | undefined, options?: FormOptions): void;
    abstract reset(options?: FormOptions): void;
    updateInitialValue(value?: FormRawDataType<DATA_TYPE, FORM_TYPE>): void;
    hasChange(): boolean;
    restore(options?: FormOptions): void;
    enableLog(): void;
    disableLog(): void;
    onChange(value: FormDataType<DATA_TYPE, FORM_TYPE> | FormRawDataType<DATA_TYPE, FORM_TYPE> | PartialGroupValueType<GetFormGroupGenericClass<FORM_TYPE, DATA_TYPE>, DATA_TYPE> | undefined): void;
    patchValue(value: FormRawDataType<DATA_TYPE, FORM_TYPE> | PartialGroupValueType<GetFormGroupGenericClass<FORM_TYPE, DATA_TYPE>, DATA_TYPE> | undefined, options?: FormOptions): void;
}
//# sourceMappingURL=form-supervisor.d.ts.map