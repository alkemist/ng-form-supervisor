import {describe, expect} from "@jest/globals";
import {SmartFormGroup} from "../src";
import {BasicInterface} from "./test-data.js";
import {FormControl} from "@angular/forms";

describe("SmartFormGroup", () => {
    describe("constructor", () => {
        expect(new SmartFormGroup<BasicInterface>({
            login: new FormControl<string>(""),
            password: new FormControl<string>(""),
        })).toBeTruthy();
    })
});