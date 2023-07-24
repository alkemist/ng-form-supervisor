import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {CompareHelper, GenericValueRecord, ValueKey} from "@alkemist/compare-engine";
import {FormSupervisor} from "./form-supervisor.js";
import {SupervisorHelper} from "./supervisor.helper.js";
import {
    ArrayType,
    ControlValueType,
    FormArrayItemConfigurationType,
    FormChange,
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
        parentSupervisor?: FormSupervisor,
        showLog = false
    ) {
        super(determineArrayIndexFn, parentSupervisor);
        this.showLog = showLog;

        const properties = CompareHelper.keys(this.controls) as (keyof DATA_TYPE)[];

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
                    this,
                    determineArrayIndexFn,
                    this.configuration?.interface[property],
                    this.showLog,
                );

                return supervisors;
            }, {} as SupervisorRecord<DATA_TYPE, FORM_GROUP_TYPE>);

        this.updateInitialValue();

        this.sub.add(this.valueChanges.subscribe((value) => {
            if (this.showLog) {
                console.log('[Group] Change detected', value)
            }

            this.onChange(value)
        }));
    }

    get form(): FORM_GROUP_TYPE {
        return this.group;
    }

    get valid(): boolean {
        return this.form.valid;
    }

    get value(): GroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE> {
        return this.form.value as GroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>;
    }

    get valueChanges(): Observable<GroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>> {
        return this.form.valueChanges as Observable<GroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>>;
    }

    get controls() {
        return this.form.controls as GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>;
    }

    setValue(value: GroupRawValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>, options?: FormOptions) {
        const emitEvent = options?.emitEvent ?? true;
        if (this.showLog) {
            console.log('[Group] Set value', value)
        }

        const properties = CompareHelper.keys(this.controls) as (keyof DATA_TYPE)[];

        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).setValue(value[property], {emitEvent: false, notifyParent: false});
        });

        this.form.setValue(value, {emitEvent});

        this.checkOptions(options);
    }

    patchValue(value: PartialGroupValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>, options?: FormOptions, notifyParent = true) {
        const emitEvent = options?.emitEvent ?? true;
        if (this.showLog) {
            console.log('[Group] Patch value', value)
        }

        const properties = CompareHelper.keys(value) as (keyof DATA_TYPE)[];

        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).patchValue(value[property], {emitEvent: false, notifyParent: false});
        });

        this.form.patchValue(
            value as GroupRawValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>,
            {emitEvent}
        );

        this.checkOptions(options);
    }

    update(): void {
        const options = {emitEvent: false};

        if (this.showLog) {
            console.log('[Group] Parent notified');
        }

        const properties = CompareHelper.keys(this.controls) as (keyof DATA_TYPE)[];

        const values = properties.map((property) =>
            (this.get(property) as FormSupervisor).value
        );

        const value = SupervisorHelper.mergeArraysToMap(properties as string[], values);

        this.form.setValue(value, options);

        this.checkOptions(options);
    }

    reset(options?: FormOptions) {
        this.form.reset(undefined, options);

        this.checkOptions(options);
    }

    clear(options?: FormOptions) {
        const properties = CompareHelper.keys(this.controls) as (keyof DATA_TYPE)[];

        properties.forEach((property) => {
            const supervisor = this.get(property);

            if (supervisor instanceof FormArraySupervisor || supervisor instanceof FormGroupSupervisor) {
                supervisor.clear({emitEvent: false, notifyParent: false})
            } else {
                (supervisor as FormSupervisor).reset({emitEvent: false, notifyParent: false});
            }
        })

        this.checkOptions(options);
    }

    updateInitialValue(value?: GroupRawValueType<GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>, DATA_TYPE>) {
        const properties = CompareHelper.keys(this.controls) as (keyof DATA_TYPE)[];

        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).updateInitialValue(
                value !== undefined ? value[property] : undefined
            );
        })

        super.updateInitialValue(value);
    }

    restore(options?: FormOptions) {
        const properties = CompareHelper.keys(this.controls) as (keyof DATA_TYPE)[];
        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).restore({emitEvent: false, notifyParent: false});
        });

        super.restore();

        this.checkOptions(options);
    }

    get<K extends keyof DATA_TYPE>(property: K)
        : SupervisorType<DATA_TYPE[K], GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]> {
        return this.supervisors[property] as SupervisorType<DATA_TYPE[K], GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K]>;
    }

    getFormProperty<K extends keyof DATA_TYPE>(property: K)
        : GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K] {
        return (this.supervisors[property] as FormSupervisor).form as GetFormGroupGenericClass<FORM_GROUP_TYPE, DATA_TYPE>[K];
    }

    getChanges() {
        const properties = CompareHelper.keys(this.controls) as (keyof DATA_TYPE)[];

        const changes = properties.map((property) =>
            (this.get(property) as FormSupervisor).getChanges()
        ) as FormChange[];

        return SupervisorHelper.mergeArraysToMap(properties as string[], changes) as GenericValueRecord<FormChange>;
    }

    enableLog() {
        super.enableLog();
        const properties = CompareHelper.keys(this.controls) as (keyof DATA_TYPE)[];
        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).enableLog();
        });
    }

    disableLog() {
        super.disableLog();
        const properties = CompareHelper.keys(this.controls) as (keyof DATA_TYPE)[];
        properties.forEach((property) => {
            (this.get(property) as FormSupervisor).disableLog();
        });
    }
}