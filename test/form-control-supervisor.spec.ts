import {describe, expect, it} from "@jest/globals";
import {FormControl, Validators} from "@angular/forms";
import {BasicUser} from "./test-data";
import {FormControlSupervisor} from "../src/form-control-supervisor";

describe("FormControlSupervisor", () => {
    it("Basic", () => {
        const control =
            new FormControl<string>("init", [Validators.required]);

        const supervisor =
            new FormControlSupervisor(control);

        testFormControl<string | null>(control, supervisor, {
            initialValue: "init",
            invalidValue: "",
            newValue: "new value"
        })

        expect.assertions(19);
    })

    it("Object", () => {
        const control =
            new FormControl<BasicUser>({id: 1, name: "user 1"}, [Validators.required]);

        const supervisor =
            new FormControlSupervisor(control);

        testFormControl<BasicUser | null>(control, supervisor, {
            initialValue: {id: 1, name: "user 1"},
            invalidValue: null,
            newValue: {id: 1, name: "user 1 bis"}
        })

        expect.assertions(19);
    });
});

interface FormControlTestData<
    DATA_TYPE
> {
    initialValue: DATA_TYPE,
    invalidValue: DATA_TYPE,
    newValue: DATA_TYPE,
}

function testFormControl<DATA_TYPE>(
    control: FormControl<DATA_TYPE>,
    supervisor: FormControlSupervisor<DATA_TYPE>,
    testData: FormControlTestData<DATA_TYPE>
) {
    expect(supervisor.value).toEqual(testData.initialValue);
    expect(supervisor.hasChange()).toBe(false);
    expect(supervisor.valid).toBe(true);

    control.setValue(testData.invalidValue);

    expect(supervisor.value).toEqual(testData.invalidValue);
    expect(supervisor.hasChange()).toBe(true);
    expect(supervisor.valid).toBe(false);

    supervisor.restore();

    expect(supervisor.hasChange()).toBe(false);
    expect(control.value).toEqual(testData.initialValue);
    expect(control.valid).toBe(true);

    control.setValue(testData.newValue);

    expect(supervisor.value).toEqual(testData.newValue);
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
    expect(control.value).toEqual(testData.newValue);
    expect(control.valid).toBe(true);
}