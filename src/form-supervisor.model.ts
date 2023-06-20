import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {CompareEngine, CompareUtils} from "@alkemist/compare-engine";
import {Observable, Subscription} from "rxjs";
import {FormGroupInterface, RawValue, Value, ValueForm} from "./form.interface.js";
import {GenericValueRecord, ValueKey} from "@alkemist/compare-engine/lib/value.interface.js";

interface FormOptions {
    onlySelf?: boolean;
    emitEvent?: boolean;
}

type FormGroupValue<FORM_TYPE extends AbstractControl> = Partial<Value<FORM_TYPE>>;
type FormArrayValue<FORM_TYPE extends AbstractControl> = Array<RawValue<FORM_TYPE>>;


export abstract class FormSupervisor<
    DATA_TYPE extends ValueForm = ValueForm,
    FORM_TYPE extends AbstractControl = AbstractControl
> {
    sub: Subscription = new Subscription();

    compareEngine: CompareEngine<FormGroupValue<FORM_TYPE> | DATA_TYPE | DATA_TYPE[]>;
    destructor: FinalizationRegistry<FormSupervisor<DATA_TYPE, FORM_TYPE>>;

    protected constructor(determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined) {
        this.compareEngine = new CompareEngine<FormGroupValue<FORM_TYPE> | DATA_TYPE | DATA_TYPE[]>(determineArrayIndexFn)

        this.destructor = new FinalizationRegistry(() => {
            this.sub.unsubscribe();
        });
    }

    abstract get valid(): boolean;

    abstract get value(): FormGroupValue<FORM_TYPE> | DATA_TYPE | DATA_TYPE[];

    abstract get valueChanges(): Observable<FormGroupValue<FORM_TYPE> | DATA_TYPE | DATA_TYPE[]>;

    abstract setValue(value: FormGroupValue<FORM_TYPE> | RawValue<FormGroup<FormGroupInterface<DATA_TYPE>>> | DATA_TYPE | DATA_TYPE[] | undefined, options?: FormOptions): void;

    abstract reset(options?: FormOptions): void;

    updateInitialValue() {
        this.compareEngine.updateLeft(this.value);
        this.compareEngine.updateRight(this.value);
        this.compareEngine.updateCompareIndex();
    }

    hasChange(): boolean {
        return this.compareEngine.hasChange();
    }

    restore(options?: FormOptions) {
        this.setValue(this.compareEngine.leftValue, options);
        this.compareEngine.leftToRight();
        this.compareEngine.updateCompareIndex();
    }

    protected onChange(value: FormGroupValue<FORM_TYPE> | DATA_TYPE | DATA_TYPE[]) {
        this.compareEngine.updateRight(this.value);
        this.compareEngine.updateCompareIndex();
    }
}

export class FormControlSupervisor<DATA_TYPE extends ValueForm> extends FormSupervisor<DATA_TYPE, FormControl<DATA_TYPE>> {
    constructor(private control: FormControl<DATA_TYPE>, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined) {
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


type GetMyClassT<C extends AbstractControl<ValueForm>> = C extends AbstractControl<infer T extends ValueForm> ? T : ValueForm;

export type FormValueRecord = GenericValueRecord<ValueForm>;

export type SupervisorRecord<DATA_TYPE extends ValueForm> = {
    [K in keyof DATA_TYPE]: FormSupervisor<DATA_TYPE[K]>
}

export class FormGroupSupervisor<DATA_TYPE extends GenericValueRecord<ValueForm>>
    extends FormSupervisor<DATA_TYPE, FormGroup<FormGroupInterface<DATA_TYPE>>> {

    supervisors: SupervisorRecord<DATA_TYPE>;

    constructor(private group: FormGroup<FormGroupInterface<DATA_TYPE>>, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined) {
        super(determineArrayIndexFn);

        const properties = Object.keys(this.controls) as (keyof DATA_TYPE)[];

        this.supervisors = properties
            .reduce((supervisors: SupervisorRecord<DATA_TYPE>, property) => {
                const control = this.controls[property] as AbstractControl;
                type ControlType = GetMyClassT<typeof control>;
                let supervisor;

                if (control instanceof FormGroup) {
                    supervisor = new FormGroupSupervisor<ControlType>(control as FormGroup<ControlType>);
                } else if (control instanceof FormArray) {
                    supervisor = new FormArraySupervisor<ControlType, AbstractControl>(control as FormArray<ControlType>);
                } else {
                    supervisor = new FormControlSupervisor<ControlType>(control as FormControl<ControlType>);
                }

                supervisors[property] = supervisor;
                return supervisors;
            }, {} as SupervisorRecord<DATA_TYPE>);

        /*properties.forEach((property: keyof DATA_TYPE) => {
            const control = this.controls[property] as AbstractControl;
            type ControlType = GetMyClassT<typeof control>;
            let supervisor;

            if (control instanceof FormGroup) {
                supervisor = new FormGroupSupervisor<ControlType>(control as FormGroup<ControlType>);
            } else if (control instanceof FormArray) {
                supervisor = new FormArraySupervisor<ControlType, AbstractControl>(control as FormArray<ControlType>);
            } else {
                supervisor = new FormControlSupervisor<ControlType>(control as FormControl<ControlType>);
            }

            this.supervisors[property] = supervisor
        })*/

        this.updateInitialValue();
        this.sub.add(this.group.valueChanges.subscribe((value) => {
            this.onChange(value)
        }));
    }

    get valid(): boolean {
        return this.group.valid;
    }

    get value(): FormGroupValue<FormGroup<FormGroupInterface<DATA_TYPE>>> {
        return this.group.value;
    }

    get valueChanges(): Observable<FormGroupValue<FormGroup<FormGroupInterface<DATA_TYPE>>>> {
        return this.group.valueChanges;
    }

    private get controls() {
        return this.group.controls as FormGroupInterface<DATA_TYPE>;
    }

    setValue(value: RawValue<FormGroup<FormGroupInterface<DATA_TYPE>>>, options?: FormOptions) {
        this.group.setValue(value, options);
    }

    reset(options?: FormOptions) {
        this.group.reset();
    }

    get(property: keyof DATA_TYPE): FormSupervisor {
        return this.supervisors[property];
    }
}

export class FormArraySupervisor<DATA_TYPE extends ValueForm, FORM_TYPE extends AbstractControl<DATA_TYPE>> extends FormSupervisor<DATA_TYPE, FormArray<FORM_TYPE>> {
    supervisors: FormSupervisor<DATA_TYPE>[] = [];

    constructor(private items: FormArray<FORM_TYPE>, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined) {
        super(determineArrayIndexFn);

        this.onChange(items.value);
        this.updateInitialValue();
        this.sub.add(this.items.valueChanges.subscribe((value) => {
            this.onChange(value)
        }));
    }

    get valid(): boolean {
        return this.items.valid;
    }

    get value(): DATA_TYPE[] {
        return this.items.value;
    }

    get valueChanges(): Observable<DATA_TYPE[]> {
        return this.items.valueChanges;
    }

    setValue(value: FormArrayValue<FORM_TYPE>, options?: FormOptions) {
        this.items.setValue(value, options);
    }

    reset(options?: FormOptions) {
        this.items.reset();
    }

    get(index: number) {
        console.log(index);
    }

    protected onChange(items: FormGroupValue<FormArray<FORM_TYPE>> | DATA_TYPE[] | DATA_TYPE) {
        super.onChange(items);
        this.supervisors = [];

        if (!CompareUtils.isObject(items) && CompareUtils.isArray<DATA_TYPE>(items)) {
            items.forEach((item, index) => {
                const control = this.items.controls[index] as AbstractControl;
                type ControlType = GetMyClassT<typeof control>;
                let supervisor;

                if (control instanceof FormGroup) {
                    supervisor = new FormGroupSupervisor<ControlType>(control as FormGroup<ControlType>);
                } else if (control instanceof FormArray) {
                    supervisor = new FormArraySupervisor<ControlType, AbstractControl>(control as FormArray<ControlType>);
                } else {
                    supervisor = new FormControlSupervisor<ControlType>(control as FormControl<ControlType>);
                }

                this.supervisors.push(supervisor);
            })
        }
    }
}
