import {Injectable} from  "angular2/core";
import {Observable, Observer} from "rxjs/Rx";

import UserIOModel from "../../../common/models/io/common/user.io.model";
import TopService from "../services/top.socket.service";
import InjectManerger from "./inject.manerger";

@Injectable()
class UserManerger {
    public user: UserIOModel;
    private service: TopService;
    private observer: Observer<void>;

    constructor(service: TopService) {
        this.service = service;
    }

    public initialize(user: UserIOModel) {
        this.user = user;
        this.initService();
    }

    private initService() {
        this.service.connect();
        this.service.onLogout = this.onLogout.bind(this);
        this.service.onUpdate = this.onUpdate.bind(this);
    }

    public clear(): Observable<void> {
        return Observable
            .create((observer: Observer<void>) => {

                this.observer = observer;

                if (this.authenticated)
                    this.service.logout();
                else
                    this.observer.complete();
            });
    }

    private onLogout() {
        delete this.user;
        this.service.close();
        this.observer.complete();
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
