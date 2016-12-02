import {Component, provide, OnInit, Pipe, PipeTransform} from  "angular2/core";
import {CanActivate} from  "angular2/router";

import {default as FormComponent, FORM_DIRECTIVES} from "../common/form.component";
import UserService from "../../services/user.http.service";
import UserModel from "../../../../common/models/impl/common/user.model";
import UserInfoModelOrg from "../../../../common/models/impl/common/user.info.model";
import UserManerger from "../../manergers/user.manerger";
import {default as UserEditComponent, Mode} from "./user.edit.component";

class UserInfoModel extends UserInfoModelOrg {
    public active: boolean = false;
}

@Pipe({
    name: "userfilter",
    pure: false
})
class UserFilterPipe implements PipeTransform {
    public transform(users: UserInfoModel[], filters: string[]) {
        if (filters.length == 0
            || filters[0] == null)
            return users;

        var filter = ".*" + filters[0] + ".*";
        return users.filter(_ => _.fullname.match(filter) != null);
    }
}

@Component({
    directives: [FORM_DIRECTIVES, UserEditComponent],
    providers: [UserService],
    viewProviders: [
        provide(FormComponent, { useExisting: UserTopComponent })
    ],
    templateUrl: "scripts/components/user/user.top.html",
    pipes: [UserFilterPipe]
})
@CanActivate((next, prev) => UserManerger.authenticated)
class UserTopComponent implements OnInit {
    private service: UserService;
    private users: UserInfoModel[] = [];
    private target: string;
    private filter: string;
    private user: UserModel;

    constructor(service: UserService, manerger: UserManerger) {
        this.service = service;
        this.user = manerger.user;
    }

    public ngOnInit() {
        this.getUsers();
    }

    private getUsers() {
        this.service.loginedlist()
            .subscribe((model) => {
                this.users = model.models.users
                    .map(_ => new UserInfoModel(_));
                this.target = this.user._id;
                this.users.filter(_ => _._id == this.target)[0].active = true;
                this.resort();
            });
    }

    private create() {
        this.clearActive();
        this.target = null;
    }

    private select(user: UserInfoModel) {
        this.clearActive();
        user.active = true;
        this.target = user._id;
    }

    private clearActive() {
        this.users.filter(_ => _.active)
            .forEach(_ => {
                _.active = false;
            });
    }

    private onChange(info: { mode: Mode, model: UserModel }) {
        var model = new UserInfoModel(info.model);
        model.active = true;

        switch (info.mode) {
            case Mode.Regist:
                model.active = true;
                this.users.push(model);
                this.resort();
                this.target = model._id;
                break;
            case Mode.Update:
                var user = this.users.filter((_ => _._id == model._id))[0];
                model.logined = user.logined;
                this.users[this.users.indexOf(user)] = model;
                this.resort();

                break;
            case Mode.Delete:
                var user = this.users.filter((_ => _._id == model._id))[0];
                this.users.splice(this.users.indexOf(user), 1);
                this.clearActive();
                this.target = null;
                break;
            default:
                break;
        }
    }

    private resort() {
        this.users.sort((v1, v2b) => {
            if (v1.fullname < v2b.fullname)
                return -1;
            else if (v1.fullname > v2b.fullname)
                return 1;
            else
                return 0;
        });
    }
}

export default UserTopComponent;
