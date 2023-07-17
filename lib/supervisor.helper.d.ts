import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {
    FormArrayGroupInterfaceType,
    FormArrayItemInterfaceType,
    FormArrayItemType,
    SupervisorType,
    ValueRecordForm
} from "./form.type.js";
import {ValueKey} from "@alkemist/compare-engine";

export declare abstract class SupervisorHelper {
    static factory<DATA_TYPE, FORM_TYPE extends FormArray | FormGroup | FormControl, SUPERVISOR_TYPE = SupervisorType<DATA_TYPE, FORM_TYPE>>(control: FORM_TYPE, determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined, itemType?: FormArrayItemInterfaceType<DATA_TYPE, FORM_TYPE>): SUPERVISOR_TYPE;

    static extractFormGroupInterface<DATA_TYPE, FORM_TYPE extends FormControl | FormGroup = FormArrayItemType<DATA_TYPE>>(array: FormArray<FORM_TYPE>): FormArrayItemInterfaceType<DATA_TYPE, FORM_TYPE>;

    static extractFormGroupItemsInterface<DATA_TYPE extends ValueRecordForm>(group: FormGroup): FormArrayGroupInterfaceType<DATA_TYPE, FormGroup>;

    static extractFormGroupItemInterface<DATA_TYPE, FORM_TYPE extends AbstractControl>(control: FORM_TYPE): FormArrayItemInterfaceType<DATA_TYPE, FORM_TYPE>;

    static factoryItem<DATA_TYPE, FORM_ARRAY_ITEM_TYPE extends FormGroup | FormControl>(itemInterface: FormArrayItemInterfaceType<DATA_TYPE, FORM_ARRAY_ITEM_TYPE>, itemValue: DATA_TYPE): FORM_ARRAY_ITEM_TYPE;

    static factoryGroupItem<DATA_TYPE extends ValueRecordForm, FORM_ARRAY_ITEM_TYPE>(itemInterface: FormArrayGroupInterfaceType<DATA_TYPE, FormGroup>, validator: () => {}, itemValue: DATA_TYPE): FORM_ARRAY_ITEM_TYPE;
}

//# sourceMappingURL=supervisor.helper.d.ts.map