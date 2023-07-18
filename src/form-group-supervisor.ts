import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {ValueKey} from "@alkemist/compare-engine";
import {FormSupervisor} from "./form-supervisor.js";
import {SupervisorHelper} from "./supervisor.helper.js";
import {
    ArrayType,
    ControlValueType,
    FormArrayItemConfigurationType,
    FormGroupInterface,
    GetFormGroupGenericClass,
    GroupRawValueType,
    GroupValueType,
    PartialGroupValueType,
    SupervisorType
} from "./form.type.js";
import {FormOptions} from "./form.interface.js";
import {FormArraySupervisor} from "./form-array-supervisor.js";

type SupervisorRecord<
    DATA_TYPE,
    FORM_GROUP_TYPE extends FormGroup<FormGroupInterface<DATA_TYPE>>,
> = {
    [K in keyof DATA_TYPE]: SupervisorType<
        DATA_TYPE[K],
        GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]
    >
}

export class FormGroupSupervisor<
    DATA_TYPE,
    FORM_GROUP_TYPE extends FormGroup,
>
    extends FormSupervisor<
        DATA_TYPE,
        FORM_GROUP_TYPE
    > {

    supervisors: SupervisorRecord<DATA_TYPE, FORM_GROUP_TYPE>;

    constructor(
        protected group: FORM_GROUP_TYPE,
        data: DATA_TYPE = group.value as DATA_TYPE,
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
        protected configuration?: FormArrayItemConfigurationType<DATA_TYPE, FORM_GROUP_TYPE>,
    ) {
        super(determineArrayIndexFn);

        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];

        this.supervisors = properties
            .reduce((supervisors: SupervisorRecord<DATA_TYPE, FORM_GROUP_TYPE>, property: keyof DATA_TYPE) => {
                const control = this.controls[property] as FormGroup | FormArray | FormControl;
                type DataType = ControlValueType<typeof control>;
                type SubDataType = ArrayType<DataType>;

                supervisors[property] = SupervisorHelper.factory<
                    SubDataType,
                    typeof control,
                    SupervisorType<
                        DATA_TYPE[any],
                        GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[any]
                    >
                >(
                    control,
                    determineArrayIndexFn,
                    this.configuration?.interface[property]
                );

                return supervisors;
            }, {} as SupervisorRecord<DATA_TYPE, FORM_GROUP_TYPE>);

        this.updateInitialValue();

        this.sub.add(this.valueChanges.subscribe((value) => {
            if (this.showLog) {
                console.log('[Group] Change detected', value)
            }

            super.onChange(value)
        }));
    }

    get form(): FORM_GROUP_TYPE {
        return this.group;
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

    setValue(value: GroupRawValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>, options?: FormOptions) {
        options = {emitEvent: false, onlySelf: false, ...options};
        this.group.setValue(value);

        if (!options.emitEvent) {
            super.onChange(value);
        }
    }

    patchValue(value: PartialGroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>, options?: FormOptions) {
        this.group.patchValue(
            value as GroupRawValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>,
            options
        );
    }

    reset(options?: FormOptions) {
        this.group.reset(undefined, options);
    }

    clear(options?: FormOptions) {
        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];

        properties.forEach((property) => {
            const supervisor = this.get(property);

            if (supervisor instanceof FormArraySupervisor || supervisor instanceof FormGroupSupervisor) {
                supervisor.clear(options)
            } else {
                (supervisor as FormSupervisor).reset(options);
            }
        })
    }

    updateInitialValue(value?: GroupRawValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>) {
        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];

        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).updateInitialValue(
                value !== undefined ? value[property] : undefined
            );
        })

        super.updateInitialValue(value);
    }

    restore(options?: FormOptions) {
        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];
        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).restore();
        });

        super.restore();
    }

    get<K extends keyof DATA_TYPE>(property: K)
        : SupervisorType<DATA_TYPE[K], GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]> {
        return this.supervisors[property] as SupervisorType<DATA_TYPE[K], GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]>;
    }

    getFormProperty<K extends keyof DATA_TYPE>(property: K)
        : GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K] {
        return (this.supervisors[property] as FormSupervisor).form as GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K];
    }

    enableLog() {
        super.enableLog();
        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];
        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).enableLog();
        });
    }

    disableLog() {
        super.disableLog();
        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];
        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).disableLog();
        });
    }
}