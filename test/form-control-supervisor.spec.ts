import {describe, expect, it} from "@jest/globals";
import {FormControl, Validators} from "@angular/forms";
import {FormControlSupervisor} from "../src";
import {User} from "./test-data";

describe("FormControlSupervisor", () => {
    it("Basic", () => {
        const control =
            new FormControl<string>("init", [Validators.required]);

        const supervisor =
            new FormControlSupervisor(control);

        expect(supervisor.value).toBe("init");
        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.valid).toBe(true);

        control.setValue("");

        expect(supervisor.value).toBe("");
        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.valid).toBe(false);

        supervisor.restore();

        expect(supervisor.hasChange()).toBe(false);
        expect(control.value).toBe("init");
        expect(control.valid).toBe(true);

        control.setValue("new value");

        expect(supervisor.value).toBe("new value");
        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.valid).toBe(true);

        supervisor.updateInitialValue();

        expect(supervisor.hasChange()).toBe(false);

        control.reset();

        expect(supervisor.hasChange()).toBe(true);
        expect(control.value).toBe(null);
        expect(control.valid).toBe(false);

        supervisor.restore();

        expect(supervisor.hasChange()).toBe(false);
        expect(control.value).toBe("new value");
        expect(control.valid).toBe(true);
    })

    it("Object", () => {
        const control =
            new FormControl<User>({id: null, name: ""}, [Validators.required]);

        const supervisor =
            new FormControlSupervisor(control);

        expect(supervisor.value).toEqual({id: null, name: ""});
        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.valid).toBe(true);
    });
});