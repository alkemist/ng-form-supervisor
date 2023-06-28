import {ValueKey} from "@alkemist/compare-engine";
import {FormArray, FormGroup} from "@angular/forms";
import {FormArrayItemInterfaceType, FormGroupInterface} from "./form.type.js";
import {FormArraySupervisor} from "./form-array-supervisor.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";

export class FormArrayGroupSupervisor<
    DATA_TYPE
> extends FormArraySupervisor<
    DATA_TYPE,
    FormGroup<FormGroupInterface<DATA_TYPE>>,
    FormGroupSupervisor<DATA_TYPE>
> {
    constructor(
        items: FormArray<FormGroup<FormGroupInterface<DATA_TYPE>>>,
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
        itemType?: FormArrayItemInterfaceType<DATA_TYPE>
    ) {
        super(items, determineArrayIndexFn, itemType);
    }
}