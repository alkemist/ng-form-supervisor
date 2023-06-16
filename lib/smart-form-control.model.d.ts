import { FormControl } from "@angular/forms";
import { CompareEngine, ValueRecord } from "@alkemist/compare-engine";
import { ValueForm } from "./form.interface.js";
export declare class SmartFormControl<T extends ValueForm> extends FormControl {
    compareEngine: CompareEngine;
    updateInitialValue(initialValue: ValueRecord): void;
    hasChange(): boolean;
    restore(options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
    updateValueAndValidity(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void;
}
//# sourceMappingURL=smart-form-control.model.d.ts.map