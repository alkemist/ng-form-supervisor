import {describe, expect, it} from "@jest/globals";
import {SmartFormArray, SmartFormGroup} from "../src";
import {BasicInterface} from "./test-data.js";

describe("SmartFormGroup", () => {
    it("should create", () => {
        expect(new SmartFormArray<BasicInterface>([])).toBeTruthy();
    })
});