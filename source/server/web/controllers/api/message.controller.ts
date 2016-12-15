import * as Q from "q";

import {WwwBaseController, controller, method} from "../common/www.base.controller";
import UserIOModel from "../../../../common/models/io/common/user.io.model";
import MessageService from "../../../service/message.service";
import ServiceResult from "../../../service/common/service.result";

@controller()
class MessageController extends WwwBaseController {

    @method()
    public list(service?: MessageService): Q.Promise<void> {
        return service.getList()
            .then((result: ServiceResult) => {
                this.json(result);
            });
    }
}

export default MessageController;
