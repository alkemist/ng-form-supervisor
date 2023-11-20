import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { ValueKey } from "@alkemist/smart-tools";
import { FormSupervisor } from "./form-supervisor.js";
import { FormOptions } from "./form.interface.js";
export declare class FormControlSupervisor<DATA_TYPE> extends FormSupervisor<DATA_TYPE, FormControl<DATA_TYPE>> {
    protected control: FormControl<DATA_TYPE>;
    constructor(control: FormControl<DATA_TYPE>, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey), parentSupervisor?: FormSupervisor, showLog?: boolean);
    get form(): FormControl<DATA_TYPE>;
    get valid(): boolean;
    get value(): DATA_TYPE;
    get valueChanges(): Observable<DATA_TYPE>;
    setValue(value: DATA_TYPE, options?: FormOptions, notifyParent?: boolean): void;
    reset(options?: FormOptions): void;
}
//# sourceMappingURL=form-control-supervisor.d.ts.map