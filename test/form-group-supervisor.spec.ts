import {describe, expect, it} from "@jest/globals";
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {USER_GROUP, UserProfile, UserRights} from "./test-data";
import {FormGroupSupervisor} from "../src/form-group-supervisor";
import {FormControlSupervisor} from "../src/form-control-supervisor";
import {FormGroupInterface} from "../src/form.type";
import {FormArrayControlSupervisor, FormArrayGroupSupervisor} from "../src/form-array-supervisor";

describe("FormGroupSupervisor", () => {
    it("Basic", () => {
        const group =
            new FormGroup/*<{
                id: FormControl<number | null>,
                name: FormControl<string | null>,
                groups: FormArray<FormControl<USER_GROUP | null>>,
                profiles: FormArray<FormGroup<FormGroupInterface<UserProfile>>>,
                rights: FormGroup<FormGroupInterface<UserRights>>
            }>*/({
                id: new FormControl<number | null>(1),
                name: new FormControl<string | null>("user 1", [
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

        /*const supervisor =
            new FormGroupSupervisor<{
                id: number | null,
                name: string
                groups: USER_GROUP[],
                profiles: UserProfile[]
                rights: UserRights
            }, {
                id: FormControl<number | null>,
                name: FormControl<string | null>,
                groups: FormArray<FormControl<USER_GROUP | null>>,
                profiles: FormArray<FormGroup<FormGroupInterface<UserProfile>>>,
                rights: FormGroup<FormGroupInterface<UserRights>>
            }>(group);*/
        const supervisor = FormGroupSupervisor.create({
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
        }, group);

        expect(supervisor.value).toEqual(initialValue);

        const arrayControlSupervisor = supervisor.getWithTypes("groups");
        const arrayGroupSupervisor = supervisor.getWithTypes("profiles");
        const groupSupervisor = supervisor.getWithTypes("rights");

        expect(supervisor.getByProperty("id")).toBeInstanceOf(FormControlSupervisor);
        expect(supervisor.getByProperty("groups")).toBeInstanceOf(FormArrayControlSupervisor);
        expect(supervisor.getByProperty("profiles")).toBeInstanceOf(FormArrayGroupSupervisor);
        expect(supervisor.getByProperty("rights")).toBeInstanceOf(FormGroupSupervisor);

        //expect(supervisor.getByProperty("groups").at(0)).toBeInstanceOf(FormControlSupervisor);
        //expect(supervisor.get("groups").at(0)).toBeInstanceOf(FormControlSupervisor);
        //expect(supervisor.getByProperty("groups", supervisor.getByControlType("groups")).at(0)).toBeInstanceOf(FormControlSupervisor);
        expect(supervisor.getFormProperty("name")).toBeInstanceOf(FormControl);
        expect(supervisor.getFormProperty("profiles")).toBeInstanceOf(FormArray);
        expect(supervisor.getFormProperty("rights")).toBeInstanceOf(FormGroup);
        //expect(supervisor.getFormProperty("profiles").push).toBeTruthy();

        expect(supervisor.hasChange()).toBe(false);
        expect(supervisor.valid).toBe(true);

        group.get("name")?.setValue("us");
        (group.get("groups") as FormArray)?.removeAt(0);
        /*(group.get("profiles") as FormArray)?.push(new FormGroup<FormGroupInterface<UserProfile>>({
            username: new FormControl<string>("", [Validators.required]),
            avatar: new FormControl<string | null>(null),
        }));*/
        const arrayControl = supervisor.getFormProperty("profiles");
        arrayControl//(arrayControl as FormArray<FormGroup<FormGroupInterface<UserProfile>>>)
            .push(new FormGroup<FormGroupInterface<UserProfile>>({
                username: new FormControl<string>("", [Validators.required]),
                avatar: new FormControl<string | null>(null),
            }));
        const groupControl = supervisor.getFormProperty("rights")
        groupControl.get("viewUsers")?.setValue(true)

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
        expect(supervisor.getWithTypes("id").value).toBe(1);
        expect(supervisor.getWithTypes("id").hasChange()).toBe(false);
        expect(supervisor.getWithTypes("id").valid).toBe(true);
        expect(supervisor.getWithTypes("name").value).toBe("us");
        expect(supervisor.getWithTypes("name").hasChange()).toBe(true);
        expect(supervisor.getWithTypes("name").valid).toBe(false);
        expect(supervisor.getWithTypes("groups").value).toEqual([]);
        expect(supervisor.getWithTypes("groups").hasChange()).toEqual(true);
        expect(supervisor.getWithTypes("groups").valid).toBe(false);
        expect(supervisor.getWithTypes("profiles").value).toEqual([
            {
                username: "username1",
                avatar: null,
            },
            {
                username: "",
                avatar: null
            }
        ]);
        expect(supervisor.getWithTypes("profiles").hasChange()).toEqual(true);
        expect(supervisor.getWithTypes("profiles").valid).toBe(false);
        expect(supervisor.getWithTypes("rights").value).toEqual({
            viewProfile: true,
            viewUsers: true
        });
        expect(supervisor.getWithTypes("rights").hasChange()).toEqual(true);
        expect(supervisor.getWithTypes("rights").valid).toBe(true);

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