import {ValueRecord} from "@alkemist/compare-engine";
import {ValueRecordForm} from "../src";

export interface BasicInterface extends ValueRecord {
    login: string;
    password: string
}

export interface ChildInterface {
    id?: number;
    label: string;
}

export interface EntityInterface {
    id?: number;
    name: string;
    children: ChildInterface[]
}

export interface User extends ValueRecordForm {
    id: number | null,
    name: string
}