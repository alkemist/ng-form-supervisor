import {ValueKey} from "@alkemist/compare-engine";
import {Observable} from "rxjs";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormSupervisor} from "./form-supervisor.js";
import {ControlValueType, FormArrayItemInterfaceType, GetFormArrayGenericClass} from "./form.type.js";
import {FormOptions} from "./form.interface.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";

export declare class FormArraySupervisor<DATA_TYPE, FORM_TYPE extends FormArray, SUPERVISOR_TYPE extends FormSupervisor<DATA_TYPE> = GetFormArrayGenericClass<FORM_TYPE> extends FormGroup ? FormGroupSupervisor<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>> : FormControlSupervisor<DATA_TYPE>> extends FormSupervisor<DATA_TYPE[], FORM_TYPE> {
    protected itemType: FormArrayItemInterfaceType<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>;
    protected supervisors: SUPERVISOR_TYPE[];
    protected _items: FORM_TYPE;

    constructor(items: FORM_TYPE, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined, itemType?: FormArrayItemInterfaceType<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>, showLog?: boolean);

    get form(): FORM_TYPE;

    get valid(): boolean;

    get length(): number;

    get value(): DATA_TYPE[] | undefined;

    get valueChanges(): Observable<ControlValueType<FormArray<GetFormArrayGenericClass<FORM_TYPE>>>>;

    setValue(itemsValue: DATA_TYPE[] | undefined, options?: FormOptions): void;

    patchValue(value: DATA_TYPE[], options?: FormOptions): void;

    reset(options?: FormOptions): void;

    clear(options?: FormOptions): void;

    at(index: number): SUPERVISOR_TYPE;

    add(itemValue: DATA_TYPE, options?: FormOptions): GetFormArrayGenericClass<FORM_TYPE>;

    remove(index: number): void;

    splice(start: number, deleteCount?: number): void;

    updateInitialValue(value?: DATA_TYPE[] | undefined): void;

    restore(options?: FormOptions): void;

    protected onChange(itemsValue: DATA_TYPE[] | undefined): void;
}

export declare class FormArrayControlSupervisor<DATA_TYPE> extends FormArraySupervisor<DATA_TYPE, FormArray<FormControl<DATA_TYPE | null>>> {
    constructor(items: FormArray<FormControl<DATA_TYPE | null>>, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined, itemType?: FormArrayItemInterfaceType<DATA_TYPE, FormControl<DATA_TYPE | null>>, showLog?: boolean);
}

export declare class FormArrayGroupSupervisor<DATA_TYPE, FORM_TYPE extends FormArray> extends FormArraySupervisor<DATA_TYPE, FORM_TYPE> {
    constructor(items: FORM_TYPE, values: DATA_TYPE[], determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined, itemType?: FormArrayItemInterfaceType<DATA_TYPE, GetFormArrayGenericClass<FORM_TYPE>>, showLog?: boolean);
}

//# sourceMappingURL=form-array-supervisor.d.ts.map