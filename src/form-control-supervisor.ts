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
    constructor(
        protected control: FormControl<DATA_TYPE>,
        determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey),
    ) {
        super(determineArrayIndexFn);

        this.updateInitialValue();
        this.sub.add(this.control.valueChanges.subscribe((value) => {
            if (this.showLog) {
                console.log('[Control] Change detected', value)
            }

            this.onChange(value)
        }));
    }

    get form(): FormControl<DATA_TYPE> {
        return this.control;
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
        const emitEvent = options?.emitEvent ?? true;
        if (this.showLog) {
            console.log('[Control] Set value', emitEvent, value)
        }

        this.form.setValue(value, {emitEvent: emitEvent});

        if (!emitEvent) {
            // Si on ne passe pas par l'évènement de mise à jour
            // on met à jour le moteur de comparaison manuellement
            this.onChange(value);
        }
    }

    reset(options?: FormOptions) {
        this.control.reset(undefined, options);
    }
}