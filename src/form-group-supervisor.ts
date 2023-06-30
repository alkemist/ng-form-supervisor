import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {ValueKey} from "@alkemist/compare-engine";
import {FormSupervisor} from "./form-supervisor.js";
import {SupervisorHelper} from "./supervisor.helper.js";
import {ControlRawValueType, ControlValueType, FormGroupInterface, GetMyClassT2, SupervisorType} from "./form.type.js";
import {FormOptions} from "./form.interface.js";

type SupervisorRecord<DATA_TYPE, FORM_GROUP_INTERFACE extends FormGroupInterface<DATA_TYPE>> = {
    [K in keyof DATA_TYPE]: SupervisorType<DATA_TYPE[K], FORM_GROUP_INTERFACE[K]>
}

export class FormGroupSupervisor<
    DATA_TYPE,
    FORM_GROUP_INTERFACE extends FormGroupInterface<DATA_TYPE> = FormGroupInterface<DATA_TYPE>,
    FORM_GROUP_TYPE extends FormGroup<FORM_GROUP_INTERFACE> = FormGroup<FORM_GROUP_INTERFACE>,
>
    extends FormSupervisor<
        DATA_TYPE,
        FORM_GROUP_TYPE
    > {

    supervisors: SupervisorRecord<DATA_TYPE, GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>>;

    //constructor(protected group: FormGroup<FORM_GROUP_INTERFACE>);

    constructor(
        protected group: FORM_GROUP_TYPE,
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
    ) {
        super(determineArrayIndexFn);

        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];

        this.supervisors = properties
            .reduce((supervisors: SupervisorRecord<DATA_TYPE, GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>>, property: keyof DATA_TYPE) => {
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
                    GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>[keyof DATA_TYPE]
                >

                return supervisors;
            }, {} as SupervisorRecord<DATA_TYPE, GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>>);

        this.updateInitialValue();

        this.sub.add(this.group.valueChanges.subscribe((value) => {
            super.onChange(value)
        }));
    }

    get form(): FORM_GROUP_TYPE {
        return this.group as FORM_GROUP_TYPE;
    }

    get valid(): boolean {
        return this.group.valid;
    }

    get value(): ControlValueType<FORM_GROUP_TYPE> {
        return this.group.value;
    }

    get valueChanges(): Observable<ControlValueType<FORM_GROUP_TYPE>> {
        return this.group.valueChanges;
    }

    get controls() {
        return this.group.controls as GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>;
    }

    static create<D, I extends FormGroupInterface<D>, E extends FormGroup<I>>(data: D, group: E): FormGroupSupervisor<D, I, E> {
        return new FormGroupSupervisor<D, I, E>(group)
    }

    setValue(value: ControlRawValueType<FormGroup<FORM_GROUP_INTERFACE>, DATA_TYPE>, options?: FormOptions) {
        this.group.setValue(value, options);
    }

    reset(options?: FormOptions) {
        this.group.reset();
    }

    restore(options?: FormOptions) {
        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];
        properties.forEach((property) => (this.getWithTypes(property) as FormSupervisor).restore())

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
    getWithTypes<
        K extends keyof DATA_TYPE,
        FORM_TYPE extends FormArray | FormGroup | FormControl
    >
    (
        property: K,
        //): SupervisorType<ArrayType<DATA_TYPE[K]>, FORM_TYPE>
    ): SupervisorType<DATA_TYPE[K], GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>[K]>


    /*ArrayType<DATA_TYPE[K]> extends ValueForm
    ? SupervisorType<ArrayType<DATA_TYPE[K]>, FormGroupInterface<DATA_TYPE>[K]>
    : SupervisorType<DATA_TYPE[K], FormGroupInterface<DATA_TYPE>[K]>*/
    //SupervisorRecord<DATA_TYPE>[DATA_TYPE[K]]
    /*FormGroupInterface<DATA_TYPE>[K] /*extends FormArray
    ? FormArraySupervisor<DATA_TYPE[K]>
    : FormGroupInterface<DATA_TYPE>[K] extends FormGroup
        ? DATA_TYPE[K] extends ValueRecordForm
            ? FormGroupSupervisor<DATA_TYPE[K]>
            : FormControlSupervisor<DATA_TYPE[K]>
        : FormControlSupervisor<DATA_TYPE[K]>*/ {
        //const _form = this.getByControlType(property, this.controls[property]);


        //type controlType = FormArray | FormGroup | FormControl
        //return this.getByControlType<DATA_TYPE[K], controlType>(property, _form) as SupervisorType<ArrayType<DATA_TYPE[K]>, FORM_TYPE>;
        //return this.supervisors[property] as SupervisorType<ArrayType<DATA_TYPE[K]>, FORM_TYPE>;
        return this.supervisors[property] as SupervisorType<DATA_TYPE[K], GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>[K]>;
    }

    getByProperty<
        K extends keyof DATA_TYPE,
    >
    (
        property: K,
    ): SupervisorType<DATA_TYPE[K], GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>[K]> {
        return this.supervisors[property] as SupervisorType<DATA_TYPE[K], GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>[K]>;
    }

    getFormProperty<
        K extends keyof DATA_TYPE,
    >
    (
        property: K,
    ): GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>[K] {
        return (this.supervisors[property] as FormSupervisor).form as GetMyClassT2<FORM_GROUP_TYPE, DATA_TYPE>[K];
    }
}