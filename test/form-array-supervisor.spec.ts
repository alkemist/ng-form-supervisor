import {describe, expect, it} from "@jest/globals";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {BasicUser} from "./test-data";
import {FormGroupInterface} from "../src";
import {FormArrayGroupSupervisor} from "../src/form-array-group-supervisor";
import {FormGroupSupervisor} from "../src/form-group-supervisor";
import {FormControlSupervisor} from "../src/form-control-supervisor";
import {FormArrayControlSupervisor} from "../src/form-array-control-supervisor";

describe("FormArraySupervisor", () => {
    it("Users group array", () => {
        const array = new FormArray<FormGroup<FormGroupInterface<BasicUser>>>([
            new FormGroup<FormGroupInterface<BasicUser>>({
                id: new FormControl<number | null>(1),
                name: new FormControl<string>("user 1", [Validators.required]),
            })
        ]);
        const supervisor
            = new FormArrayGroupSupervisor<BasicUser>(array);

        testFormArray(array, supervisor, {
            initialValidItem: {id: 1, name: "user 1"},
            invalidItem: {id: null, name: ""},
            newInvalidElement: new FormGroup<FormGroupInterface<BasicUser>>({
                id: new FormControl<number | null>(null),
                name: new FormControl<string>("", [Validators.required]),
            }),
            newValidItem: {id: 2, name: "user 2"},
            invalidFirstItem: {id: 1, name: ""}
        });

        expect(supervisor.at(0)).toBeInstanceOf(FormGroupSupervisor);
        expect(supervisor.at(0).get('id')).toBeInstanceOf(FormControlSupervisor);
    });

    it("Numbers control array", () => {
        const array = new FormArray([
            new FormControl(5, [Validators.required])
        ])

        const supervisor
            = new FormArrayControlSupervisor<number>(array);

        testFormArray<number | null, FormControl>(array, supervisor, {
            initialValidItem: 5,
            invalidItem: null,
            newInvalidElement: new FormControl<number | null>(null, [Validators.required]),
            newValidItem: 99,
            invalidFirstItem: null
        });

        expect(supervisor.at(0)).toBeInstanceOf(FormControlSupervisor);
    });

    it("User control array", () => {
        const array = new FormArray([
            new FormControl<BasicUser>({id: 1, name: "user 1"}, [Validators.required])
        ])

        const supervisor
            = new FormArrayControlSupervisor<BasicUser>(array);

        testFormArray<BasicUser | null, FormControl>(array, supervisor, {
            initialValidItem: {id: 1, name: "user 1"},
            invalidItem: null,
            newInvalidElement: new FormControl<BasicUser | null>(null, [Validators.required]),
            newValidItem: {id: 2, name: "user 2"},
            invalidFirstItem: null
        });

        expect(supervisor.at(0)).toBeInstanceOf(FormControlSupervisor);
    });
});

interface FormArrayTestData<
    DATA_TYPE,
    FORM_TYPE extends FormControl | FormGroup
> {
    initialValidItem: DATA_TYPE,
    invalidItem: DATA_TYPE,
    newInvalidElement: FORM_TYPE,
    newValidItem: DATA_TYPE,
    invalidFirstItem: DATA_TYPE
}

function testFormArray<DATA_TYPE, FORM_TYPE extends FormControl | FormGroup>(
    array: FormArray<FORM_TYPE>,
    supervisor: FormArrayGroupSupervisor<DATA_TYPE> | FormArrayControlSupervisor<DATA_TYPE>,
    testData: FormArrayTestData<DATA_TYPE, FORM_TYPE>
) {
    expect(supervisor.value).toEqual([testData.initialValidItem]);
    expect(supervisor.hasChange()).toBe(false);
    expect(supervisor.valid).toBe(true);
    expect(supervisor.at(0).value).toEqual(testData.initialValidItem);
    expect(supervisor.at(0).hasChange()).toBe(false);
    expect(supervisor.at(0).valid).toBe(true);

    array.at(0).setValue(testData.invalidItem);

    expect(supervisor.value).toEqual([testData.invalidItem]);
    expect(supervisor.hasChange()).toBe(true);
    expect(supervisor.valid).toBe(false);
    expect(supervisor.at(0).value).toEqual(testData.invalidItem);
    expect(supervisor.at(0).hasChange()).toBe(true);
    expect(supervisor.at(0).valid).toBe(false);

    supervisor.restore();

    expect(supervisor.hasChange()).toBe(false);
    expect(supervisor.at(0).hasChange()).toBe(false);
    expect(array.value).toEqual([testData.initialValidItem]);
    expect(array.valid).toBe(true);
    expect(array.at(0).value).toEqual(testData.initialValidItem);
    expect(array.at(0).valid).toBe(true);

    array.push(testData.newInvalidElement);

    expect(supervisor.value).toEqual([
        testData.initialValidItem,
        testData.invalidItem
    ]);
    expect(supervisor.length).toBe(2);
    expect(supervisor.hasChange()).toBe(true);
    expect(supervisor.at(0).hasChange()).toBe(false);
    expect(supervisor.at(1).hasChange()).toBe(false);
    expect(supervisor.valid).toBe(false);

    supervisor.add(testData.invalidItem);

    expect(array.length).toBe(3);
    expect(array.value).toEqual([
        testData.initialValidItem,
        testData.invalidItem,
        testData.invalidItem
    ]);
    expect(array.at(0).valid).toBe(true);
    expect(array.at(1).valid).toBe(false);
    expect(array.at(2).valid).toBe(false);
    expect(array.valid).toBe(false);

    supervisor.remove(0);

    expect(supervisor.hasChange()).toBe(true);
    expect(supervisor.at(0).hasChange()).toBe(true);
    expect(supervisor.at(1).hasChange()).toBe(false);

    expect(array.value).toEqual([
        testData.invalidItem,
        testData.invalidItem
    ]);
    expect(array.length).toBe(2);
    expect(array.valid).toBe(false);

    supervisor.at(0).restore();

    expect(array.value).toEqual([
        testData.initialValidItem,
        testData.invalidItem,
    ]);
    expect(array.at(0).valid).toBe(true);
    expect(array.at(1).valid).toBe(false);
    expect(array.valid).toBe(false);

    supervisor.splice(0, 1);

    expect(array.value).toEqual([
        testData.invalidItem,
    ]);
    expect(array.at(0).valid).toBe(false);
    expect(array.valid).toBe(false);

    supervisor.clear();

    expect(array.value).toEqual([]);
    expect(array.valid).toBe(true);

    supervisor.restore();

    expect(supervisor.hasChange()).toBe(false);
    expect(supervisor.at(0).value).toEqual(testData.initialValidItem);
    expect(supervisor.at(0).hasChange()).toBe(false);
    expect(supervisor.at(0).valid).toBe(true);
    expect(array.value).toEqual([testData.initialValidItem,]);
    expect(array.valid).toBe(true);

    supervisor.setValue([
        testData.initialValidItem,
        testData.newValidItem,
    ]);

    expect(supervisor.hasChange()).toBe(true);
    expect(supervisor.at(0).hasChange()).toBe(false);
    expect(supervisor.at(1).hasChange()).toBe(false);
    expect(array.value).toEqual([
        testData.initialValidItem,
        testData.newValidItem,
    ]);
    expect(array.valid).toBe(true);

    supervisor.updateInitialValue();

    expect(supervisor.hasChange()).toBe(false);

    supervisor.at(0).setValue(testData.invalidFirstItem as never);

    expect(supervisor.hasChange()).toBe(true);
    expect(supervisor.at(0).hasChange()).toBe(true);
    expect(supervisor.at(1).hasChange()).toBe(false);
    expect(array.valid).toBe(false);
    expect(array.at(0).valid).toBe(false);
    expect(array.at(0).value).toEqual(testData.invalidFirstItem);

    supervisor.restore();

    expect(supervisor.hasChange()).toBe(false);
    expect(supervisor.at(0).hasChange()).toBe(false);
    expect(supervisor.at(1).hasChange()).toBe(false);
    expect(array.value).toEqual([
        testData.initialValidItem,
        testData.newValidItem,
    ]);
    expect(array.valid).toBe(true);
}