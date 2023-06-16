import {describe, expect} from "@jest/globals";
import {SmartFormControl, SmartFormGroup} from "../src";

describe("SmartFormGroup", () => {
    describe("constructor", () => {
        expect(new SmartFormControl<string>()).toBeTruthy();
    })
});