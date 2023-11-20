import { FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { GenericValueRecord, ValueKey } from "@alkemist/smart-tools";
import { FormSupervisor } from "./form-supervisor.js";
import { FormArrayItemConfigurationType, FormChange, FormGroupInterface, GetFormGroupGenericClass, GroupRawValueType, GroupValueType, PartialGroupValueType, SupervisorType } from "./form.type.js";
import { FormOptions } from "./form.interface.js";
type SupervisorRecord<DATA_TYPE, FORM_GROUP_TYPE extends FormGroup<FormGroupInterface<DATA_TYPE>>> = {
    [K in keyof DATA_TYPE]: SupervisorType<DATA_TYPE[K], GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]>;
};
export declare class FormGroupSupervisor<DATA_TYPE, FORM_GROUP_TYPE extends FormGroup> extends FormSupervisor<DATA_TYPE, FORM_GROUP_TYPE> {
    protected group: FORM_GROUP_TYPE;
    protected configuration?: FormArrayItemConfigurationType<DATA_TYPE, FORM_GROUP_TYPE> | undefined;
    supervisors: SupervisorRecord<DATA_TYPE, FORM_GROUP_TYPE>;
    constructor(group: FORM_GROUP_TYPE, data?: DATA_TYPE, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined, configuration?: FormArrayItemConfigurationType<DATA_TYPE, FORM_GROUP_TYPE> | undefined, parentSupervisor?: FormSupervisor, showLog?: boolean);
    get form(): FORM_GROUP_TYPE;
    get valid(): boolean;
    get value(): GroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>;
    get valueChanges(): Observable<GroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>>;
    get controls(): GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>;
    private get properties();
    setValue(value: GroupRawValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>, options?: FormOptions): void;
    patchValue(value: PartialGroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>, options?: FormOptions, notifyParent?: boolean): void;
    update(): void;
    reset(options?: FormOptions): void;
    clear(options?: FormOptions): void;
    updateInitialValue(value: GroupRawValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>): void;
    resetInitialValue(): void;
    restore(options?: FormOptions): void;
    get<K extends keyof DATA_TYPE>(property: K): SupervisorType<DATA_TYPE[K], GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]>;
    getFormProperty<K extends keyof DATA_TYPE>(property: K): GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K];
    getChanges(): GenericValueRecord<FormChange>;
    enableLog(): void;
    disableLog(): void;
}
export {};
//# sourceMappingURL=form-group-supervisor.d.ts.map