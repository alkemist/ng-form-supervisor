export interface BasicUser {
    id: number | null,
    name: string
}

export type USER_GROUP = "USER" | "ADMIN" | "SUPERADMIN";

export interface ComplexeUser extends BasicUser {
    groups: USER_GROUP[],
    profiles: {
        username: string,
        avatar: string | null,
        badges: string[],
    }[]
    rights: {
        viewProfile: boolean,
        viewUsers: boolean
    }
}