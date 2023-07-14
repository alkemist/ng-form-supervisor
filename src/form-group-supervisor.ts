import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {ValueKey} from "@alkemist/compare-engine";
import {FormSupervisor} from "./form-supervisor.js";
import {SupervisorHelper} from "./supervisor.helper.js";
import {
    ControlRawValueType,
    ControlValueType,
    FormGroupGeneric,
    FormRawDataType,
    GetFormGroupGenericClass,
    GroupValueType,
    SupervisorType
} from "./form.type.js";
import {FormOptions} from "./form.interface.js";

type SupervisorRecord<DATA_TYPE, FORM_GROUP_TYPE extends FormGroup<FormGroupGeneric<DATA_TYPE>>> = {
    [K in keyof DATA_TYPE]: SupervisorType<DATA_TYPE[K], GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]>
}

export class FormGroupSupervisor<
    DATA_TYPE,
    FORM_GROUP_TYPE extends FormGroup<FormGroupGeneric<DATA_TYPE>> = FormGroup<FormGroupGeneric<DATA_TYPE>>,
>
    extends FormSupervisor<
        DATA_TYPE,
        FORM_GROUP_TYPE
    > {

    supervisors: SupervisorRecord<DATA_TYPE, FORM_GROUP_TYPE>;

    constructor(
        protected group: FORM_GROUP_TYPE,
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined
    ) {
        super(determineArrayIndexFn);

        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];

        this.updateInitialValue();

        this.supervisors = properties
            .reduce((supervisors: SupervisorRecord<DATA_TYPE, FORM_GROUP_TYPE>, property: keyof DATA_TYPE) => {
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
                    GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[keyof DATA_TYPE]
                >

                return supervisors;
            }, {} as SupervisorRecord<DATA_TYPE, FORM_GROUP_TYPE>);

        this.sub.add(this.valueChanges.subscribe((value) => {
            super.onChange(value)
        }));
    }

    static create<
        D,
        F extends FormGroup<FormGroupGeneric<D>> = FormGroup<FormGroupGeneric<D>>
    >(data: D, group: F): FormGroupSupervisor<D, F> {
        return new FormGroupSupervisor<D, F>(group)
    }

    get form(): FORM_GROUP_TYPE {
        return this.group as FORM_GROUP_TYPE;
    }

    get valid(): boolean {
        return this.group.valid;
    }

    get value(): GroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE> {
        return this.group.value as GroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>;
    }

    get valueChanges(): Observable<GroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>> {
        return this.group.valueChanges as Observable<GroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>>;
    }

    get controls() {
        return this.group.controls as GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>;
    }

    setValue(value: { [K in keyof DATA_TYPE]: ControlRawValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]>; }, options?: FormOptions) {
        this.group.setValue(value, options);
    }

    reset(options?: FormOptions) {
        this.group.reset();
    }

    updateInitialValue(value?: { [K in keyof DATA_TYPE]: ControlRawValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]>; }) {
        if (value) {
            const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];
            properties.forEach((property) => {
                (this.get(property) as FormSupervisor).updateInitialValue(value[property] as FormRawDataType);
            })
        }

        super.updateInitialValue(value);
    }

    restore(options?: FormOptions) {
        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];
        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).restore();
        })

        super.restore();
    }

    get<
        K extends keyof DATA_TYPE
    >
    (
        property: K,
    ): SupervisorType<DATA_TYPE[K], GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]> {
        return this.supervisors[property] as SupervisorType<DATA_TYPE[K], GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]>;
    }

    getFormProperty<
        K extends keyof DATA_TYPE,
    >
    (
        property: K,
    ): GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K] {
        return (this.supervisors[property] as FormSupervisor).form as GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K];
    }
}