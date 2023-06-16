import {ValueRecord} from "@alkemist/compare-engine";

export interface BasicInterface extends ValueRecord{
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