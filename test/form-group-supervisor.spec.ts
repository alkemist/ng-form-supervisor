import {describe, expect, it} from "@jest/globals";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FormGroupSupervisor} from "../src";
import {User} from "./test-data";

describe("FormGroupSupervisor", () => {
    it("Basic", () => {
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
        expect(supervisor.valid).toBe(true);
        expect(supervisor.get("id").value).toBe(null);
        expect(supervisor.get("id").hasChange()).toBe(false);
        expect(supervisor.get("name").value).toBe("new user");
        expect(supervisor.get("name").hasChange()).toBe(true);

        supervisor.restore();

        expect(supervisor.hasChange()).toBe(false);
        expect(group.value).toEqual({id: null, name: ""});
        expect(group.valid).toBe(false);
        expect(group.controls["id"].value).toBe(null);
        expect(group.controls["name"].value).toBe("");

        group.setValue({id: 1, name: "user 1"})

        expect(supervisor.value).toEqual({id: 1, name: "user 1"});
        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.valid).toBe(true);
        expect(supervisor.get("id").value).toBe(1);
        expect(supervisor.get("id").hasChange()).toBe(true);
        expect(supervisor.get("name").value).toBe("user 1");
        expect(supervisor.get("name").hasChange()).toBe(true);

        supervisor.updateInitialValue();

        expect(supervisor.hasChange()).toBe(false);

        supervisor.reset();

        expect(supervisor.hasChange()).toBe(true);
        expect(group.value).toEqual({id: null, name: null});
        expect(group.valid).toBe(false);

        supervisor.restore();

        expect(supervisor.hasChange()).toBe(false);
        expect(group.value).toEqual({id: 1, name: "user 1"});
        expect(group.valid).toBe(true);
    })
});