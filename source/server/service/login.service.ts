import * as Q from "q";

import BaseService from "./common/base.service";
import ServideResult from "./common/service.result";
import {service, method} from "./common/service.decorator";
import UserIOModel from "../../common/models/io/common/user.io.model";
import UserBusiness from "../business/user.business";
import Exception from "../common/exceptions/exception";
import {ErrorConstant} from "../../common/constants/error.constant";

@service
class LoginService extends BaseService {

    @method()
    public login(model: UserIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(UserBusiness);

        return business.findByUserId(model.userId)
            .then((search) => {
                if (search == null ||
                    search.password != model.password)
                    return Promise.reject(new Exception(ErrorConstant.Code
                        .Error.FAILURE_LOGIN));

                // clear password
                search.password = null;
                result.add("user", search);
            });
    }
}

export default LoginService;
