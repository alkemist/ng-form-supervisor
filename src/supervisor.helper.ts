import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {FormArraySupervisor} from "./form-array-supervisor.js";
import {FormControlSupervisor} from "./form-control-supervisor.js";
import {FormSupervisor} from "./form-supervisor.js";
import {FormGroupSupervisor} from "./form-group-supervisor.js";
import {GetMyClassT, ValueForm} from "./form.type.js";

export abstract class SupervisorHelper {
    static factory<DATA_TYPE extends ValueForm>(control: AbstractControl): FormSupervisor<DATA_TYPE> {
        type ControlType = GetMyClassT<typeof control>;
        let supervisor;

        if (control instanceof FormGroup) {
            supervisor = new FormGroupSupervisor<ControlType>(control as FormGroup<ControlType>);
        } else if (control instanceof FormArray) {
            supervisor = new FormArraySupervisor<ControlType>(control as FormArray<ControlType>);
        } else {
            supervisor = new FormControlSupervisor<ControlType>(control as FormControl<ControlType>);
        }

        return supervisor;
    }

    static controlFactory<DATA_TYPE extends ValueForm>(value: DATA_TYPE) {

    }
}