import {describe, expect, it} from "@jest/globals";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {ComplexeUser, USER_GROUP, UserProfile, UserRights} from "./test-data";
import {FormGroupSupervisor} from "../src/form-group-supervisor";
import {FormControlSupervisor} from "../src/form-control-supervisor";
import {FormGroupInterface} from "../src/form.type";
import {FormArrayControlSupervisor, FormArrayGroupSupervisor} from "../src/form-array-supervisor";

describe("FormGroupSupervisor", () => {
    it("Basic", () => {
        const group =
            new FormGroup<FormGroupInterface<ComplexeUser>>({
                id: new FormControl<number | null>(1),
                name: new FormControl<string>("user 1", [
                    Validators.required,
                    Validators.minLength(3),
                ]),
                groups: new FormArray<FormControl<USER_GROUP | null>>([
                    new FormControl<USER_GROUP>("USER")
                ], [Validators.required]),
                profiles: new FormArray<FormGroup<FormGroupInterface<UserProfile>>>([
                    new FormGroup<FormGroupInterface<UserProfile>>({
                        username: new FormControl<string>("username1", [Validators.required]),
                        avatar: new FormControl<string | null>(null),
                    })
                ], [Validators.required]),
                rights: new FormGroup<FormGroupInterface<UserRights>>({
                    viewProfile: new FormControl<boolean>(true),
                    viewUsers: new FormControl<boolean>(false),
                }),
            });

        expect(group).toBeTruthy()

        const initialValue = {
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

        const supervisor =
            new FormGroupSupervisor<ComplexeUser>(group);

        expect(supervisor.value).toEqual(initialValue);

        const arrayControlSupervisor = supervisor.get("groups");
        const arrayGroupSupervisor = supervisor.get("profiles");
        const groupSupervisor = supervisor.get("rights");

        expect(supervisor.get("id")).toBeInstanceOf(FormControlSupervisor);
        expect(supervisor.get("groups")).toBeInstanceOf(FormArrayControlSupervisor);
        expect(supervisor.get("profiles")).toBeInstanceOf(FormArrayGroupSupervisor);
        expect(supervisor.get("rights")).toBeInstanceOf(FormGroupSupervisor);

        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.valid).toBe(true);

        group.get("name")?.setValue("us");
        (group.get("groups") as FormArray)?.removeAt(0);
        (group.get("profiles") as FormArray)?.push(new FormGroup<FormGroupInterface<UserProfile>>({
            username: new FormControl<string>("", [Validators.required]),
            avatar: new FormControl<string | null>(null),
        }));

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
            viewUsers: false
        });
        expect(supervisor.get("rights").hasChange()).toEqual(false);
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