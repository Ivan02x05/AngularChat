import * as Q from "q";

import WWWBaseController from "../common/www.base.controller";
import {ChatGetMessagesMaterialModel} from "../../../../common/models/impl/chat/chat.message.model";
import {controller, method} from "../common/controller.decorator";
import ChatService from "../../../service/chat.service";
import ServiceResult from "../../../service/common/service.result";

@controller
class ChatController extends WWWBaseController {

    @method({ model: ChatGetMessagesMaterialModel, services: [ChatService] })
    protected files(model?: ChatGetMessagesMaterialModel, service?: ChatService): Q.Promise<void> {
        return service.getMaterials(model)
            .then((result: ServiceResult) => this.file(<{ path: string, name: string }>result.get("file")));
    }
}

export default ChatController;
