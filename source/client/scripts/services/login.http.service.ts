import {Injectable} from  "angular2/core";

import HttpService from "./common/http.service";
import UserModel from "../../../common/models/impl/common/user.model";

@Injectable()
class LoginService {
    private http: HttpService;
    constructor(http: HttpService) {
        this.http = http;
    }

    public login(model: UserModel) {
        return this.http.postJson("login/login", model);
    }
}

export default LoginService;
