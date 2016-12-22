import * as Q from "q";

import BaseBusiness from "./common/base.business";
import ChatViewedNoSchema from "../database/schemas/chat.viewedno.schema";
import ChatViewedNoIOModel from "../../common/models/io/chat/chat.viewedno.io.model";

class ChatViewedNoBusiness extends BaseBusiness {

    public findById(id: any): Q.Promise<ChatViewedNoIOModel> {
        return this.database.model(ChatViewedNoSchema).findById(id)
            .then(result => new ChatViewedNoIOModel(result));
    }

    public save(model: ChatViewedNoIOModel): Q.Promise<ChatViewedNoIOModel> {
        const viewed = this.database.model(ChatViewedNoSchema);
        return viewed.findById(model._id)
            .then(_ => {
                if (_ == null) {
                    _ = viewed.toDocument(_);
                    _._id = model._id;
                }
                _.chats = model.chats;
                return _;
            })
            .then(doc => viewed.save(doc))
            .then(result => new ChatViewedNoIOModel(result));
    }
}

export default ChatViewedNoBusiness;
