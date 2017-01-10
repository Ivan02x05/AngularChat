import {Injectable} from  "angular2/core";
import {Observable} from "rxjs/Rx";

import UserIOModel from "../../../common/models/io/common/user.io.model";
import TopService from "../services/top.socket.service";
import LoginService from "../services/login.http.service";
import InjectManerger from "./inject.manerger";
import Exception from "../exceptions/exception";
import {ErrorConstant} from "../../../common/constants/error.constant";

@Injectable()
class UserManerger {
    public user: UserIOModel;

    private topService: TopService;
    private loginService: LoginService;

    constructor(topService: TopService, loginService: LoginService) {
        this.topService = topService;
        this.loginService = loginService;
    }

    public login(user: UserIOModel): Observable<UserIOModel> {
        return this.loginService.login(user)
            .flatMap<UserIOModel>(model => {
                if (model.hasError)
                    return Observable.throw(new Exception(model.errors));
                else if (!model.models.user)
                    return Observable.throw(new Exception(ErrorConstant.Code
                        .Error.FAILURE_LOGIN));
                else
                    return Observable.of(new UserIOModel(model.models.user));
            })
            .flatMap(user => {
                this.user = user;
                this.initService();
                return Observable.of(this.user);
            });
    }

    private initService() {
        this.topService.connect();
        this.topService.onDelete = this.onDelete.bind(this);
        this.topService.onUpdate = this.onUpdate.bind(this);
    }

    public logout(): Observable<void> {
        return Observable.of(this.authenticated)
            .flatMap<void>(authenticated => {
                if (authenticated)
                    return this.loginService.logout()
                        .flatMap(() => {
                            this.topService.close();
                            this.user = null;
                            return Observable.empty();
                        });
                else
                    return Observable.empty();
            });
    }

    private onDelete() {
        this.logout().subscribe(
            null,
            null,
            () => { }
        );
    }

    private onUpdate(user: UserIOModel) {
        this.user = user;
    }

    public get authenticated(): boolean {
        return this.user != null;
    }

    public static get instanse(): UserManerger {
        return InjectManerger.injector.get(UserManerger);
    }

    public static get authenticated(): boolean {
        return UserManerger.instanse.authenticated;
    }
}

export default UserManerger;
