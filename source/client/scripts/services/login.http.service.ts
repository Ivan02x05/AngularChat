import {Injectable} from  "angular2/core";

import HttpService from "./common/http.service";
import UserIOModel from "../../../common/models/io/common/user.io.model";

@Injectable()
class LoginService {
    private http: HttpService;
    constructor(http: HttpService) {
        this.http = http;
    }

    public login(model: UserIOModel) {
        return this.http.postJson("login/login", model);
    }
}

export default LoginService;
