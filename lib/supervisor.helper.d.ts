import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { FormArrayGroupInterfaceType, FormArrayItemConfigurationType, FormGroupInterface, ValueRecordForm } from "./form.type.js";
import { GenericValueRecord, ValueKey } from "@alkemist/compare-engine";
import { FormSupervisor } from "./form-supervisor.js";
export declare abstract class SupervisorHelper {
    static factory<DATA_TYPE, FORM_TYPE extends FormArray | FormGroup | FormControl, SUPERVISOR_TYPE>(control: FORM_TYPE, parentSupervisor: FormSupervisor, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined, itemType?: FormArrayItemConfigurationType<DATA_TYPE, FORM_TYPE>, showLog?: boolean): SUPERVISOR_TYPE;
    static isFormGroup(control: FormArray | FormGroup | FormControl): control is FormGroup;
    static isFormArray(control: FormArray | FormGroup | FormControl): control is FormArray;
    static extractFormGroupInterface<DATA_TYPE, FORM_TYPE extends FormControl | FormGroup>(array: FormArray<FORM_TYPE>): FormArrayItemConfigurationType<DATA_TYPE, FORM_TYPE>;
    static extractFormGroupItemsInterface<DATA_TYPE extends ValueRecordForm>(group: FormGroup): FormArrayGroupInterfaceType<DATA_TYPE, FormGroup>;
    static extractFormGroupItemInterface<DATA_TYPE, FORM_TYPE extends AbstractControl>(control: FORM_TYPE): FormArrayItemConfigurationType<DATA_TYPE, FORM_TYPE>;
    static factoryItem<DATA_TYPE, FORM_ARRAY_ITEM_TYPE extends FormGroup | FormControl | FormArray>(itemInterface: FormArrayItemConfigurationType<DATA_TYPE, FORM_ARRAY_ITEM_TYPE>, itemValue: DATA_TYPE): FORM_ARRAY_ITEM_TYPE;
    static factoryArrayGroupItem<DATA_TYPE extends ValueRecordForm>(itemInterface: FormArrayGroupInterfaceType<DATA_TYPE, FormGroup>, validator: () => {}, itemValue: DATA_TYPE): FormGroup<FormGroupInterface<DATA_TYPE>>;
    static mergeArraysToMap<VALUE>(keys: string[], values: VALUE[]): GenericValueRecord<VALUE>;
}
//# sourceMappingURL=supervisor.helper.d.ts.map