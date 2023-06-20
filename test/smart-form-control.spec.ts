import {describe, expect, it} from "@jest/globals";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {FormArraySupervisor, FormControlSupervisor, FormGroupSupervisor, FormValueRecord} from "../src";

describe("FormSupervisor", () => {
    interface User extends FormValueRecord {
        id: number | null,
        name: string
    }

    it("FormControl", () => {
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

        expect(control.value).toBe("init");
        expect(supervisor.hasChange()).toBe(false);
        expect(control.valid).toBe(true);

        control.setValue("new value");

        expect(supervisor.value).toBe("new value");
        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.valid).toBe(true);

        supervisor.updateInitialValue();

        expect(supervisor.hasChange()).toBe(false);

        control.reset();

        expect(control.value).toBe(null);
        expect(supervisor.hasChange()).toBe(true);
        expect(control.valid).toBe(false);

        supervisor.restore();

        expect(control.value).toBe("new value");
        expect(supervisor.hasChange()).toBe(false);
        expect(control.valid).toBe(true);
    })

    it("FormGroup", () => {
        const group =
            new FormGroup({
                id: new FormControl<number | null>(null),
                name: new FormControl<string>("", [Validators.required]),
            });

        const supervisor =
            new FormGroupSupervisor<User>(group);

        expect(supervisor.value).toEqual({id: null, name: ""});
        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.valid).toBe(false);

        group.get("name")?.setValue("new user")

        expect(supervisor.value).toEqual({id: null, name: "new user"});
        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.get("id").value).toBe(null);
        expect(supervisor.get("id").hasChange()).toBe(false);
        expect(supervisor.get("name").value).toBe("new user");
        expect(supervisor.get("name").hasChange()).toBe(true);
        expect(supervisor.valid).toBe(true);

        supervisor.restore();

        expect(group.value).toEqual({id: null, name: ""});
        expect(supervisor.hasChange()).toBe(false);
        expect(group.controls["id"].value).toBe(null);
        expect(group.controls["name"].value).toBe("");
        expect(group.valid).toBe(false);

        group.setValue({id: 1, name: "user 1"})

        expect(supervisor.value).toEqual({id: 1, name: "user 1"});
        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.get("id").value).toBe(1);
        expect(supervisor.get("id").hasChange()).toBe(true);
        expect(supervisor.get("name").value).toBe("user 1");
        expect(supervisor.get("name").hasChange()).toBe(true);
        expect(supervisor.valid).toBe(true);

        supervisor.updateInitialValue();

        expect(supervisor.hasChange()).toBe(false);

        supervisor.reset();

        expect(group.value).toEqual({id: null, name: null});
        expect(supervisor.hasChange()).toBe(true);
        expect(group.valid).toBe(false);

        supervisor.restore();

        expect(group.value).toEqual({id: 1, name: "user 1"});
        expect(supervisor.hasChange()).toBe(false);
        expect(group.valid).toBe(true);
    })

    it("FormArray", () => {
        const array = new FormArray([
            new FormGroup({
                id: new FormControl<number | null>(1),
                name: new FormControl<string>("user 1", [Validators.required]),
            })
        ]);

        const supervisor
            = new FormArraySupervisor<User, FormGroup>(array);

        expect(supervisor.value).toEqual([{id: 1, name: "user 1"}]);
        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.valid).toBe(true);
    });
});