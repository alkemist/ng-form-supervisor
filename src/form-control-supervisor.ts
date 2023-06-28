import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";
import {ValueKey} from "@alkemist/compare-engine";
import {FormSupervisor} from "./form-supervisor.js";
import {FormOptions} from "./form.interface.js";

export class FormControlSupervisor<DATA_TYPE>
    extends FormSupervisor<
        DATA_TYPE,
        FormControl<DATA_TYPE>
    > {
    constructor(protected control: FormControl<DATA_TYPE>, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey)) {
        super(determineArrayIndexFn);

        this.updateInitialValue();
        this.sub.add(this.control.valueChanges.subscribe((value) => {
            this.onChange(value)
        }));
    }

    get valid(): boolean {
        return this.control.valid;
    }

    get value(): DATA_TYPE {
        return this.control.value;
    }

    get valueChanges(): Observable<DATA_TYPE> {
        return this.control.valueChanges;
    }

    setValue(value: DATA_TYPE, options?: FormOptions) {
        this.control.setValue(value, options);
    }

    reset(options?: FormOptions) {
        this.control.reset();
    }
}