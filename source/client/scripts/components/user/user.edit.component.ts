
import {Component, provide, Input, Output, EventEmitter, ViewChild} from  "angular2/core";

import {default as FormComponent, FORM_DIRECTIVES} from "../common/form.component";
import UserService from "../../services/user.http.service";
import {UserIOModel as UserIOModelOrg, UserGetIOModel} from "../../../../common/models/io/common/user.io.model";
import ResponseIOModel from "../../../../common/models/io/common/response.io.model";
import {Observable} from "rxjs/Rx";

export const enum Mode {
    Regist = 0,
    Update,
    Delete
}

class UserIOModel extends UserIOModelOrg {
    public password2: string;

    constructor(obj?: any) {
        super(obj);

        this.password2 = this.password;
    }
}

@Component({
    selector: "user-edit",
    directives: [FORM_DIRECTIVES],
    viewProviders: [
        provide(FormComponent, { useExisting: UserEditComponent })
    ],
    templateUrl: "scripts/components/user/user.edit.html",
    inputs: ["service", "target"],
    outputs: ["onChange"]
})
class UserEditComponent extends FormComponent {
    private model: UserIOModel = null;
    private mode: Mode = Mode.Regist;
    private service: UserService;
    private set target(id: string) {
        var initIOModel = () => {
            setTimeout(() => {
                this.model = new UserIOModel({ name: { first: null, last: null } });
                this.mode = Mode.Regist;
            }, 0);
        };

        if (id != null) {
            this.service.getUser(new UserGetIOModel({ _id: id })).subscribe((model) => {
                this.mode = Mode.Update;
                this.model = new UserIOModel(model.models.user);

                setTimeout(() => {
                    this.form.controls["password"].updateValueAndValidity();
                    this.form.controls["password2"].updateValueAndValidity();
                }, 0);
            });
        } else {

            if (this.model != null) {
                setTimeout(() => {
                    this.model = null;
                    initIOModel();
                }, 0);
            } else
                initIOModel();
        }
        this.clearError();
    }

    private onChange: EventEmitter<{ mode: Mode, model: UserIOModel }> = new EventEmitter();

    private get isNew(): boolean {
        return this.mode == Mode.Regist;
    }

    private onPasswordChange() {
        setTimeout(() => {
            this.form.controls["password2"].updateValueAndValidity();
        }, 0);
    }

    private regist() {
        this.edit(Mode.Regist);
    }

    private update() {
        this.edit(Mode.Update);
    }

    private delete() {
        this.edit(Mode.Delete);
    }

    private edit(mode: Mode) {
        this.clearError();

        this.submit(() => {
            var method: (model: UserIOModelOrg) => Observable<ResponseIOModel>;
            switch (mode) {
                case Mode.Regist:
                    method = this.service.regist;
                    break;
                case Mode.Update:
                    method = this.service.update;
                    break;
                case Mode.Delete:
                    method = this.service.delete;
                    break;
                default:
                    break;
            }

            method.bind(this.service)(new UserIOModelOrg(this.model)).subscribe((model) => {
                if (model.hasError) {
                    this.addError(model.errors);
                } else {
                    this.model = new UserIOModel(model.models.user);
                    this.onChange.emit({ mode: mode, model: this.model });
                }
            });
        });
    }
}

export default UserEditComponent;
