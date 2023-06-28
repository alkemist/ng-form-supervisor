import {ValueKey} from "@alkemist/compare-engine";
import {FormArray, FormControl} from "@angular/forms";
import {FormArrayItemInterfaceType} from "./form.type.js";
import {FormArraySupervisor} from "./form-array-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";

export class FormArrayControlSupervisor<
    DATA_TYPE
> extends FormArraySupervisor<
    DATA_TYPE,
    FormControl<DATA_TYPE | null>,
    FormControlSupervisor<DATA_TYPE>
> {
    constructor(
        items: FormArray<FormControl<DATA_TYPE | null>>,
        determineArrayIndexFn: ((paths: ValueKey[]) => ValueKey) | undefined = undefined,
        itemType?: FormArrayItemInterfaceType<DATA_TYPE>
    ) {
        super(items, determineArrayIndexFn, itemType);
    }
}