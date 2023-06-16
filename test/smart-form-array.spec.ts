import {describe, expect} from "@jest/globals";
import {SmartFormArray, SmartFormGroup} from "../src";
import {BasicInterface} from "./test-data.js";

describe("SmartFormGroup", () => {
    describe("constructor", () => {
        expect(new SmartFormArray<BasicInterface>([])).toBeTruthy();
    })
});