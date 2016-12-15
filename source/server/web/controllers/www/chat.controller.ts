import * as Q from "q";

import {WwwBaseController, controller, method} from "../common/www.base.controller";
import {ChatGetMessagesMaterialIOModel} from "../../../../common/models/io/chat/chat.message.io.model";
import ChatService from "../../../service/chat.service";
import ServiceResult from "../../../service/common/service.result";

@controller()
class ChatController extends WwwBaseController {

    @method()
    protected files(model?: ChatGetMessagesMaterialIOModel, service?: ChatService): Q.Promise<void> {
        return service.getMaterials(model)
            .then((result: ServiceResult) => this.file(<{ path: string, name: string }>result.get("file")));
    }
}

export default ChatController;
