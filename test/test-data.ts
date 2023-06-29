import {GenericValueRecord} from "@alkemist/compare-engine";

export interface BasicUser {
    id: number | null,
    name: string
}

export type USER_GROUP = "USER" | "ADMIN"

export interface UserProfile extends GenericValueRecord<string> {
    username: string,
    avatar: string,
}

export interface UserRights extends GenericValueRecord<boolean> {
    viewProfile: boolean,
    viewUsers: boolean
}

export interface ComplexeUser extends BasicUser {
    groups: USER_GROUP[],
    profiles: UserProfile[]
    rights: UserRights
}