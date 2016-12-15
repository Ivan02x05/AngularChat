import {Component, OnInit, provide, forwardRef, Pipe, PipeTransform} from  "angular2/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from  "angular2/common";

import UserService from "../../services/user.http.service";
import UserInfoIOModel from "../../../../common/models/io/common/user.info.io.model";

const noop = () => { };
const VALUE_ACCESSOR = provide(NG_VALUE_ACCESSOR, {
    useExisting: forwardRef(() => UsersCheckboxComponent),
    multi: true
});

class UserInfoIOModelCheck extends UserInfoIOModel {
    public selected: boolean;
}

@Pipe({
    name: "onlychecked"
})
class ChatFilterPipe implements PipeTransform {
    public transform(users: UserInfoIOModelCheck[], filters: boolean[]) {
        if (filters.length == 0)
            return users;

        if (!filters[0])
            return users;

        return users.filter(_ => _.selected);
    }
}

@Component({
    selector: "users-checkbox",
    providers: [UserService, VALUE_ACCESSOR],
    templateUrl: "scripts/components/common/users-checkbox.html",
    inputs: [
        "disabled",
        "onlychecked"
    ],
    pipes: [ChatFilterPipe]
})
class UsersCheckboxComponent implements OnInit, ControlValueAccessor {
    private service: UserService;
    private users: UserInfoIOModelCheck[] = [];
    private disabled: boolean;
    private onlychecked: boolean;

    private _value: UserInfoIOModel[];
    private _onTouchedCallback: (_?: any) => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    constructor(service: UserService) {
        this.service = service;
    }

    public ngOnInit() {
        this.initUsers();
    }

    public get value(): UserInfoIOModel[] {
        return this._value;
    }

    public set value(value: UserInfoIOModel[]) {
        if (this._value != value) {
            this._value = value;
            this.updateUsers(this.users);
            this._onChangeCallback(value);
        }
    }

    public writeValue(value: any) {
        this.value = value;
    }

    public registerOnChange(fn: any) {
        this._onChangeCallback = fn;
    }

    public registerOnTouched(fn: any) {
        this._onTouchedCallback = fn;
    }

    private initUsers() {
        this.service.list()
            .map<UserInfoIOModelCheck[]>(model => {
                if (model.models && model.models.users)
                    return model.models.users
                        .map(_ => new UserInfoIOModelCheck(<UserInfoIOModel>_));
                else
                    return [];
            })
            .subscribe((models) => {
                this.updateUsers(models);
            });
    }

    private updateUsers(users: UserInfoIOModelCheck[]) {
        users.forEach(_ => {
            _.selected = this._value &&
                this._value.some(__ => _._id == __._id);
        })
        this.users = users;
    }

    private onChange(event: boolean, target: UserInfoIOModelCheck) {
        target.selected = event;
        this._value = this.users
            .filter(_ => _.selected)
            .map(_ => new UserInfoIOModel(_));
        this._onChangeCallback(this._value);
    }

    private onTouched() {
        this._onTouchedCallback();
    }
}

export default UsersCheckboxComponent;
