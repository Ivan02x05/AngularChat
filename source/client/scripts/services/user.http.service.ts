import {Injectable} from  "angular2/core";

import HttpService from "./common/http.service";
import {UserIOModel, UserGetIOModel} from "../../../common/models/io/common/user.io.model";

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

    public getUser(model: UserGetIOModel) {
        return this.http.postJson("user/user", model);
    }

    public regist(model: UserIOModel) {
        return this.http.postJson("user/regist", model);
    }

    public update(model: UserIOModel) {
        return this.http.postJson("user/update", model);
    }

    public delete(model: UserIOModel) {
        return this.http.postJson("user/delete", model);
    }
}

export default UserService;
