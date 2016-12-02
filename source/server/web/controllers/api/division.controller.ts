import * as Q from "q";

import WWWBaseController from "../common/www.base.controller";
import UserModel from "../../../../common/models/impl/common/user.model";
import {controller, method} from "../common/controller.decorator";
import DivisionService from "../../../service/division.service";
import ServiceResult from "../../../service/common/service.result";

@controller
class DivisionController extends WWWBaseController {

    @method({ services: [DivisionService] })
    public list(service?: DivisionService): Q.Promise<void> {
        return service.getList()
            .then((result: ServiceResult) => {
                this.json(result);
            });
    }
}

export default DivisionController;
