import {describe, expect, it} from "@jest/globals";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {ComplexeUser, USER_GROUP, UserProfile, UserRights} from "./test-data";
import {FormGroupSupervisor} from "../src/form-group-supervisor";
import {FormControlSupervisor} from "../src/form-control-supervisor";
import {FormGroupInterface} from "../src/form.type";
import {FormArrayControlSupervisor, FormArrayGroupSupervisor} from "../src/form-array-supervisor";

describe("FormGroupSupervisor", () => {
    it("Basic", () => {
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
                    new FormGroup<FormGroupInterface<UserProfile>>({
                        username: new FormControl<string>(initialValue.profiles[0].username, [Validators.required]),
                        avatar: new FormControl<string | null>(initialValue.profiles[0].avatar),
                    })
                ], [Validators.required]),
                rights: new FormGroup<FormGroupInterface<UserRights>>({
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
        (group.get("profiles") as FormArray)?.push(new FormGroup<FormGroupInterface<UserProfile>>({
            username: new FormControl<string>("", [Validators.required]),
            avatar: new FormControl<string | null>(null),
        }));
        group.get("rights")?.get("viewUsers")?.setValue(true)

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
                viewProfile: true,
                viewUsers: true
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
        expect(supervisor.get("profiles").valid).toBe(false);
        expect(supervisor.get("rights").value).toEqual({
            viewProfile: true,
            viewUsers: true
        });
        expect(supervisor.get("rights").hasChange()).toEqual(true);
        expect(supervisor.get("rights").valid).toBe(true);

        supervisor.restore();

        expect(supervisor.hasChange()).toBe(false);
        expect(group.value).toEqual(initialValue);
        expect(group.valid).toBe(true);
        expect(group.get("id")?.value).toBe(initialValue.id);
        expect(group.get("name")?.value).toBe(initialValue.name);
        expect(group.get("groups")?.value).toEqual(initialValue.groups);
        expect(group.get("profiles")?.value).toEqual(initialValue.profiles);
        expect(group.get("rights")?.value).toEqual(initialValue.rights);

        supervisor.get("name").setValue("us");
        supervisor.get('groups').remove(0);
        supervisor.get('groups').add("ADMIN");
        supervisor.get("profiles").add({
            username: "username2",
            avatar: null
        });
        const rightsSupervisor = supervisor.get("rights");
        const viewUsersSupervisor = rightsSupervisor.get("viewUsers");
        //supervisor.get("rights").get("viewUsers").setValue(true)

        /*group.setValue({id: 1, name: "user 1"})

        expect(supervisor.value).toEqual({id: 1, name: "user 1"});
        expect(supervisor.hasChange()).toBe(true);
        expect(supervisor.valid).toBe(true);
        expect(supervisor.get("id").value).toBe(1);
        expect(supervisor.get("id").hasChange()).toBe(true);
        expect(supervisor.get("name").value).toBe("user 1");
        expect(supervisor.get("name").hasChange()).toBe(true);

        supervisor.updateInitialValue();

        expect(supervisor.hasChange()).toBe(false);

        supervisor.reset();

        expect(supervisor.hasChange()).toBe(true);
        expect(group.value).toEqual({id: null, name: null});
        expect(group.valid).toBe(false);

        supervisor.restore();

        expect(supervisor.hasChange()).toBe(false);
        expect(group.value).toEqual({id: 1, name: "user 1"});
        expect(group.valid).toBe(true);*/
    })
});