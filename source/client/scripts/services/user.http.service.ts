import {Injectable} from  "angular2/core";

import HttpService from "./common/http.service";
import {UserModel, UserGetModel} from "../../../common/models/impl/common/user.model";

@Injectable()
class UserService {
    private http: HttpService;
    constructor(http: HttpService) {
        this.http = http;
    }

    public list() {
        return this.http.postJson("user/list");
    }

    public loginedlist() {
        return this.http.postJson("user/loginedlist");
    }

    public getUser(model: UserGetModel) {
        return this.http.postJson("user/user", model);
    }

    public regist(model: UserModel) {
        return this.http.postJson("user/regist", model);
    }

    public update(model: UserModel) {
        return this.http.postJson("user/update", model);
    }

    public delete(model: UserModel) {
        return this.http.postJson("user/delete", model);
    }
}

export default UserService;
