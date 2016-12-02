import * as Q from "q";

import WWWBaseController from "../common/www.base.controller";
import UserModel from "../../../../common/models/impl/common/user.model";
import {controller, method} from "../common/controller.decorator";
import LoginService from "../../../service/login.service";
import ServiceResult from "../../../service/common/service.result";
import ResponseModel from "../../../../common/models/impl/common/response.model";
import {SystemConstant} from "../../../../common/constants/system.constant";

@controller
class LoginController extends WWWBaseController {

    @method()
    protected index(): Q.Promise<void> {
        var deferred: Q.Deferred<void> = Q.defer<void>();
        (<any>this.session).destroy(() => {
            this.response.render("index", { systemname: SystemConstant.SYSTEM_NAME });
            deferred.resolve();
        });
        return deferred.promise;
    }

    @method({ model: UserModel, services: [LoginService] })
    protected login(model?: UserModel, service?: LoginService): Q.Promise<void> {
        return service.login(model)
            .then((result: ServiceResult) => {
                // set session
                this.session.user = <UserModel>result.get("user");
                this.json(result);
            })
    }
}

export default LoginController;
