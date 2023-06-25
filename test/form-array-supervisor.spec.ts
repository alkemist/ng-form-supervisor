import {describe, expect, it} from "@jest/globals";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "./test-data";
import {FormArraySupervisor} from "../src";

describe("FormArraySupervisor", () => {
    it("Users array", () => {
        const array = new FormArray([
            new FormGroup({
                id: new FormControl<number | null>(1),
                name: new FormControl<string>("user 1", [Validators.required]),
            })
        ]);

        const supervisor
            = new FormArraySupervisor<User>(array);

        expect(supervisor.value).toEqual([{id: 1, name: "user 1"}]);
        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.valid).toBe(true);
        expect(supervisor.at(0).value).toEqual({id: 1, name: "user 1"});
        expect(supervisor.at(0).hasChange()).toBe(false);
        expect(supervisor.at(0).valid).toBe(true);

        array.at(0).get('name')?.setValue("");

        expect(supervisor.value).toEqual([{id: 1, name: ""}]);
        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.valid).toBe(false);
        expect(supervisor.at(0).value).toEqual({id: 1, name: ""});
        expect(supervisor.at(0).hasChange()).toBe(true);
        expect(supervisor.at(0).valid).toBe(false);

        supervisor.restore();

        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.at(0).hasChange()).toBe(false);
        expect(array.value).toEqual([{id: 1, name: "user 1"}]);
        expect(array.valid).toBe(true);
        expect(array.at(0).value).toEqual({id: 1, name: "user 1"});
        expect(array.at(0).valid).toBe(true);

        supervisor.add({id: null, name: ""});

        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.at(0).hasChange()).toBe(false);
        expect(supervisor.at(1).hasChange()).toBe(false);
        expect(array.value).toEqual([{id: 1, name: "user 1"}, {id: null, name: ""}]);
        expect(array.valid).toBe(false);
        expect(array.at(1).value).toEqual({id: null, name: ""});
        expect(array.at(0).valid).toBe(true);
        expect(array.at(1).valid).toBe(false);
    });

    it("Numbers array", () => {
        const array = new FormArray([
            new FormControl<number>(5)
        ])

        const supervisor
            = new FormArraySupervisor<number>(array);

        expect(supervisor.value).toEqual([5]);
        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.valid).toBe(true);
        expect(supervisor.at(0).value).toEqual(5);
        expect(supervisor.at(0).hasChange()).toBe(false);
        expect(supervisor.at(0).valid).toBe(true);

        supervisor.add(9);

        /*new FormArraySupervisor<User>(new FormArray<FormControl<User | null>>([
            new FormControl<User>({id: null, name: ""} as User)
        ]))
            .add({id: null, name: ""} as User);*/
    });
});