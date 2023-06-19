import {describe, expect, it} from "@jest/globals";
import {SmartFormControl, SmartFormGroup} from "../src";

describe("SmartFormGroup", () => {
    it("should create", () => {
        expect(new SmartFormControl<string>()).toBeTruthy();
    })
});