import * as Q from "q";

import WWWBaseController from "../common/www.base.controller";
import UserModel from "../../../../common/models/impl/common/user.model";
import {controller, method} from "../common/controller.decorator";
import MessageService from "../../../service/message.service";
import ServiceResult from "../../../service/common/service.result";

@controller
class MessageController extends WWWBaseController {

    @method({ services: [MessageService] })
    public list(service?: MessageService): Q.Promise<void> {
        return service.getList()
            .then((result: ServiceResult) => {
                this.json(result);
            });
    }
}

export default MessageController;
