import {describe, expect, it} from "@jest/globals";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {ComplexeUser, USER_GROUP} from "./test-data";
import {FormGroupSupervisor} from "../src/form-group-supervisor";
import {FormControlSupervisor} from "../src/form-control-supervisor";
import {FormArrayControlSupervisor, FormArrayGroupSupervisor} from "../src/form-array-supervisor";

describe("FormGroupSupervisor", () => {
    it("ComplexeUser", () => {
        const initialValue: ComplexeUser = {
            id: 1,
            name: "user 1",
            groups: ["USER"],
            profiles: [
                {
                    username: "username1",
                    avatar: null
                }
            ],
            rights: {
                viewProfile: true,
                viewUsers: false
            }
        }

        const newValue: ComplexeUser = {
            id: 1,
            name: "admin",
            groups: ['SUPERADMIN'],
            profiles: [
                {
                    username: "username1-bis",
                    avatar: null
                },
                {
                    username: "username2",
                    avatar: null
                }
            ],
            rights: {
                viewProfile: true,
                viewUsers: true
            }
        }

        const group =
            new FormGroup({
                id: new FormControl<number | null>(initialValue.id),
                name: new FormControl<string | null>(initialValue.name, [
                    Validators.required,
                    Validators.minLength(3),
                ]),
                groups: new FormArray([
                    new FormControl<USER_GROUP>(initialValue.groups[0])
                ], [Validators.required]),

                profiles: new FormArray([
                    new FormGroup({
                        username: new FormControl<string>(initialValue.profiles[0].username, [Validators.required]),
                        avatar: new FormControl<string | null>(initialValue.profiles[0].avatar),
                    })
                ], [Validators.required]),

                rights: new FormGroup({
                    viewProfile: new FormControl<boolean | null>(initialValue.rights.viewProfile),
                    viewUsers: new FormControl<boolean | null>(initialValue.rights.viewUsers),
                }),
            });

        const supervisor =
            new FormGroupSupervisor(group, group.value as ComplexeUser);

        expect(supervisor.value).toEqual(initialValue);

        expect(supervisor.get("name")).toBeInstanceOf(FormControlSupervisor);
        expect(supervisor.get("groups")).toBeInstanceOf(FormArrayControlSupervisor);
        expect(supervisor.get("groups").at(0)).toBeInstanceOf(FormControlSupervisor);
        expect(supervisor.get("profiles")).toBeInstanceOf(FormArrayGroupSupervisor);
        expect(supervisor.get("profiles").at(0)).toBeInstanceOf(FormGroupSupervisor);
        expect(supervisor.get("profiles").at(0).get('username')).toBeInstanceOf(FormControlSupervisor);
        expect(supervisor.get("rights")).toBeInstanceOf(FormGroupSupervisor);
        expect(supervisor.get("rights").get("viewProfile")).toBeInstanceOf(FormControlSupervisor);

        expect(supervisor.getFormProperty("name")).toBeInstanceOf(FormControl);
        expect(supervisor.getFormProperty("groups")).toBeInstanceOf(FormArray);
        expect(supervisor.getFormProperty("groups").at(0)).toBeInstanceOf(FormControl);
        expect(supervisor.getFormProperty("profiles")).toBeInstanceOf(FormArray);
        expect(supervisor.getFormProperty("profiles").at(0)).toBeInstanceOf(FormGroup);
        expect(supervisor.getFormProperty("profiles").at(0).get('username')).toBeInstanceOf(FormControl);
        expect(supervisor.getFormProperty("rights")).toBeInstanceOf(FormGroup);
        expect(supervisor.getFormProperty("rights").get('viewProfile')).toBeInstanceOf(FormControl);

        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.valid).toBe(true);

        group.get("name")?.setValue("us");
        (group.get("groups") as FormArray)?.removeAt(0);
        (group.get("profiles") as FormArray)?.push(new FormGroup({
            username: new FormControl<string>("", [Validators.required]),
            avatar: new FormControl<string | null>(null),
        }));
        group.get("rights")?.get("viewProfile")?.setValue(false)

        expect(supervisor.value).toEqual({
            ...initialValue,
            name: "us",
            groups: [],
            profiles: [
                {
                    username: "username1",
                    avatar: null
                },
                {
                    username: "",
                    avatar: null
                }
            ],
            rights: {
                viewProfile: false,
                viewUsers: false
            }
        });
        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.valid).toBe(false);
        expect(supervisor.get("id").value).toBe(1);
        expect(supervisor.get("id").hasChange()).toBe(false);
        expect(supervisor.get("id").valid).toBe(true);
        expect(supervisor.get("name").value).toBe("us");
        expect(supervisor.get("name").hasChange()).toBe(true);
        expect(supervisor.get("name").valid).toBe(false);
        expect(supervisor.get("groups").value).toEqual([]);
        expect(supervisor.get("groups").hasChange()).toEqual(true);
        expect(supervisor.get("groups").valid).toBe(false);
        expect(supervisor.get("profiles").value).toEqual([
            {
                username: "username1",
                avatar: null,
            },
            {
                username: "",
                avatar: null
            }
        ]);
        expect(supervisor.get("profiles").hasChange()).toEqual(true);
        expect(supervisor.get('profiles').at(0).hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).get('username').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).get('avatar').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(1).hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(1).get('username').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(1).get('avatar').hasChange()).toBe(false);
        expect(supervisor.get("profiles").valid).toBe(false);
        expect(supervisor.get("rights").value).toEqual({
            viewProfile: false,
            viewUsers: false
        });
        expect(supervisor.get("rights").hasChange()).toEqual(true);
        expect(supervisor.get("rights").get("viewProfile").hasChange()).toBe(true);
        expect(supervisor.get("rights").get("viewUsers").hasChange()).toBe(false);
        expect(supervisor.get("rights").valid).toBe(true);

        supervisor.restore();

        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.get("id").hasChange()).toBe(false);
        expect(supervisor.get("name").hasChange()).toBe(false);
        expect(supervisor.get('groups').hasChange()).toBe(false);
        expect(supervisor.get('groups').at(0).hasChange()).toBe(false);
        expect(supervisor.get('profiles').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).get('username').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).get('avatar').hasChange()).toBe(false);
        expect(supervisor.get("rights").hasChange()).toBe(false);
        expect(supervisor.get("rights").get("viewProfile").hasChange()).toBe(false);
        expect(supervisor.get("rights").get("viewUsers").hasChange()).toBe(false);
        expect(group.value).toEqual(initialValue);
        expect(group.valid).toBe(true);
        expect(group.get("id")?.value).toBe(initialValue.id);
        expect(group.get("name")?.value).toBe(initialValue.name);
        expect(group.get("groups")?.value).toEqual(initialValue.groups);
        expect(group.get("profiles")?.value).toEqual(initialValue.profiles);
        expect(group.get("rights")?.value).toEqual(initialValue.rights);

        supervisor.get("name").setValue(newValue.name);
        supervisor.get('groups').remove(0);
        supervisor.get('groups').add("ADMIN");
        supervisor.get('groups').at(0).setValue(newValue.groups[0]);
        supervisor.get('profiles').at(0).get("username").setValue(newValue.profiles[0].username);
        supervisor.get("profiles").add(newValue.profiles[1]);
        supervisor.get("rights").get("viewUsers").setValue(newValue.rights.viewUsers);

        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.get("id").hasChange()).toBe(false);
        expect(supervisor.get("name").hasChange()).toBe(true);
        expect(supervisor.get('groups').hasChange()).toBe(true);
        expect(supervisor.get('groups').at(0).hasChange()).toBe(true);
        expect(supervisor.get('profiles').hasChange()).toBe(true);
        expect(supervisor.get('profiles').at(0).hasChange()).toBe(true);
        expect(supervisor.get('profiles').at(0).get('username').hasChange()).toBe(true);
        expect(supervisor.get('profiles').at(0).get('avatar').hasChange()).toBe(false);
        expect(supervisor.get("rights").hasChange()).toBe(true);
        expect(supervisor.get("rights").get("viewProfile").hasChange()).toBe(false);
        expect(supervisor.get("rights").get("viewUsers").hasChange()).toBe(true);
        expect(group.value).toEqual(newValue);

        supervisor.updateInitialValue();

        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.get("id").hasChange()).toBe(false);
        expect(supervisor.get("name").hasChange()).toBe(false);
        expect(supervisor.get('groups').hasChange()).toBe(false);
        expect(supervisor.get('groups').at(0).hasChange()).toBe(false);
        expect(supervisor.get('profiles').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).get('username').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).get('avatar').hasChange()).toBe(false);
        expect(supervisor.get("rights").hasChange()).toBe(false);
        expect(supervisor.get("rights").get("viewProfile").hasChange()).toBe(false);
        expect(supervisor.get("rights").get("viewUsers").hasChange()).toBe(false);

        supervisor.reset();

        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.get("id").hasChange()).toBe(true);
        expect(supervisor.get("name").hasChange()).toBe(true);
        expect(supervisor.get('groups').hasChange()).toBe(true);
        expect(supervisor.get('groups').at(0).hasChange()).toBe(true);
        expect(supervisor.get('profiles').hasChange()).toBe(true);
        expect(supervisor.get('profiles').at(0).hasChange()).toBe(true);
        expect(supervisor.get('profiles').at(0).get('username').hasChange()).toBe(true);
        expect(supervisor.get('profiles').at(0).get('avatar').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(1).hasChange()).toBe(true);
        expect(supervisor.get('profiles').at(1).get('username').hasChange()).toBe(true);
        expect(supervisor.get('profiles').at(1).get('avatar').hasChange()).toBe(false);
        expect(supervisor.get("rights").hasChange()).toBe(true);
        expect(supervisor.get("rights").get("viewProfile").hasChange()).toBe(true);
        expect(supervisor.get("rights").get("viewUsers").hasChange()).toBe(true);
        expect(group.value).toEqual({
            id: null,
            name: null,
            groups: [null],
            profiles: [{
                username: null,
                avatar: null,
            }, {
                username: null,
                avatar: null,
            }],
            rights: {
                viewProfile: null,
                viewUsers: null,
            }
        });
        expect(group.valid).toBe(false);

        supervisor.clear();

        expect(group.value).toEqual({
            id: null,
            name: null,
            groups: [],
            profiles: [],
            rights: {
                viewProfile: null,
                viewUsers: null,
            }
        });

        supervisor.restore();

        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.get("id").hasChange()).toBe(false);
        expect(supervisor.get("name").hasChange()).toBe(false);
        expect(supervisor.get('groups').hasChange()).toBe(false);
        expect(supervisor.get('groups').at(0).hasChange()).toBe(false);
        expect(supervisor.get('profiles').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).get('username').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(0).get('avatar').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(1).hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(1).get('username').hasChange()).toBe(false);
        expect(supervisor.get('profiles').at(1).get('avatar').hasChange()).toBe(false);
        expect(supervisor.get("rights").hasChange()).toBe(false);
        expect(supervisor.get("rights").get("viewProfile").hasChange()).toBe(false);
        expect(supervisor.get("rights").get("viewUsers").hasChange()).toBe(false);
        expect(group.value).toEqual(newValue);
        expect(group.valid).toBe(true);
    })
});