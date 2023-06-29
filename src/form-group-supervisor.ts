import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {ValueKey} from "@alkemist/compare-engine";
import {FormSupervisor} from "./form-supervisor.js";
import {SupervisorHelper} from "./supervisor.helper.js";
import {ControlRawValueType, ControlValueType, FormGroupInterface, SupervisorType} from "./form.type.js";
import {FormOptions} from "./form.interface.js";

type SupervisorRecord<DATA_TYPE> = {
    [K in keyof DATA_TYPE]: SupervisorType<DATA_TYPE[K], FormGroupInterface<DATA_TYPE>[K]>
}

export class FormGroupSupervisor<DATA_TYPE>
    extends FormSupervisor<
        DATA_TYPE,
        FormGroup<FormGroupInterface<DATA_TYPE>>
    > {

    supervisors: SupervisorRecord<DATA_TYPE>;

    constructor(
        protected group: FormGroup<FormGroupInterface<DATA_TYPE>>,
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
    ) {
        super(determineArrayIndexFn);

        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];

        this.supervisors = properties
            .reduce((supervisors: SupervisorRecord<DATA_TYPE>, property: keyof DATA_TYPE) => {
                const control = this.controls[property] as FormGroup | FormArray | FormControl;
                type DataType = ControlValueType<typeof control>;

                const supervisor = SupervisorHelper.factory<
                    DataType,
                    typeof control
                >(
                    control,
                    determineArrayIndexFn,
                );

                supervisors[property] = supervisor as SupervisorType<
                    DataType,
                    FormGroupInterface<DATA_TYPE>[keyof DATA_TYPE]
                >

                return supervisors;
            }, {} as SupervisorRecord<DATA_TYPE>);

        this.updateInitialValue();

        this.sub.add(this.group.valueChanges.subscribe((value) => {
            super.onChange(value)
        }));
    }

    get valid(): boolean {
        return this.group.valid;
    }

    get value(): ControlValueType<FormGroup<FormGroupInterface<DATA_TYPE>>> {
        return this.group.value;
    }

    get valueChanges(): Observable<ControlValueType<FormGroup<FormGroupInterface<DATA_TYPE>>>> {
        return this.group.valueChanges;
    }

    private get controls() {
        return this.group.controls as FormGroupInterface<DATA_TYPE>;
    }

    setValue(value: ControlRawValueType<FormGroup<FormGroupInterface<DATA_TYPE>>>, options?: FormOptions) {
        this.group.setValue(value, options);
    }

    reset(options?: FormOptions) {
        this.group.reset();
    }

    restore(options?: FormOptions) {
        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];
        properties.forEach((property) => this.get(property).restore())

        super.restore();
    }

    /*get(property: keyof DATA_TYPE):
        /*DATA_TYPE[keyof DATA_TYPE] extends ValueRecordForm
            ? FormGroupSupervisor<DATA_TYPE[keyof DATA_TYPE]> | FormControlSupervisor<DATA_TYPE[keyof DATA_TYPE]> | FormArraySupervisor<DATA_TYPE[keyof DATA_TYPE]>
            : FormControlSupervisor<DATA_TYPE[keyof DATA_TYPE]> | FormArraySupervisor<DATA_TYPE[keyof DATA_TYPE]>
    /*SupervisorType<DATA_TYPE[keyof DATA_TYPE],
        FormGroupInterface<DATA_TYPE>[keyof DATA_TYPE]> {

        return this.supervisors[property];
    }*/

    //get<T extends keyof DATA_TYPE>(property: T): typeof this.supervisors[T] {
    //get<K extends keyof DATA_TYPE = keyof DATA_TYPE>(property: K): SupervisorType<DATA_TYPE[K], FormGroupInterface<DATA_TYPE>[K]> {
    get<K extends keyof DATA_TYPE>(property: K): FormGroupInterface<DATA_TYPE>[K] /*extends FormArray
        ? FormArraySupervisor<DATA_TYPE[K]>
        : FormGroupInterface<DATA_TYPE>[K] extends FormGroup
            ? DATA_TYPE[K] extends ValueRecordForm
                ? FormGroupSupervisor<DATA_TYPE[K]>
                : FormControlSupervisor<DATA_TYPE[K]>
            : FormControlSupervisor<DATA_TYPE[K]>*/ {
        return this.supervisors[property];
    }
}