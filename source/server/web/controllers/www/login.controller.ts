import * as Q from "q";

import {WwwBaseController, controller, method} from "../common/www.base.controller";
import UserIOModel from "../../../../common/models/io/common/user.io.model";
import LoginService from "../../../service/login.service";
import ServiceResult from "../../../service/common/service.result";
import ResponseIOModel from "../../../../common/models/io/common/response.io.model";
import {SystemConstant} from "../../../../common/constants/system.constant";

@controller()
class LoginController extends WwwBaseController {

    @method()
    protected index(): Q.Promise<void> {
        return Q.nfcall(this.session.destroy.bind(this.session))
            .then(() => {
                this.response.render("index", { systemname: SystemConstant.SYSTEM_NAME });
            });
    }

    @method()
    protected login(model?: UserIOModel, service?: LoginService): Q.Promise<void> {
        return service.login(model)
            .then((result: ServiceResult) => {
                this.session.user = <UserIOModel>result.get("user");
                this.json(result);
            });
    }

    @method()
    protected logout(): Q.Promise<void> {
        return Q.fcall<boolean>(() => this.session != null)
            .then(flag => {
                if (flag)
                    return Q.nfcall(this.session.destroy.bind(this.session))
            })
            .then(() => {
                this.json(new ResponseIOModel());
            });
    }
}

export default LoginController;
