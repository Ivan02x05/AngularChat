import * as Q from "q";

import BaseService from "./common/base.service";
import ServideResult from "./common/service.result";
import {service, method} from "./common/service.decorator";
import MessageManerger from "../common/manergers/message.manerger";
import MessageIOModel from "../../common/models/io/common/message.io.model";

@service
class MessageService extends BaseService {

    @method()
    public getList(): Q.Promise<any> {
        return Q.fcall<void>(() => {
            var result: ServideResult = this.result;
            var manerger: MessageManerger = BaseService
                .getComponent(MessageManerger);

            // convert
            var messages: MessageIOModel[] = [];
            manerger.messages.forEach((v, k) => {
                messages.push(v);
            });
            result.add("messages", messages);
        });
    }
}

export default MessageService;
