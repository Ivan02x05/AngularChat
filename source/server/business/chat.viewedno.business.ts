import * as Q from "q";

import BaseBusiness from "./common/base.business";
import ChatViewedNoSchema from "../database/schemas/chat.viewedno.schema";
import ChatViewedNoIOModel from "../../common/models/io/chat/chat.viewedno.io.model";
import SessionManerger from "../common/manergers/session.manerger";

class ChatViewedNoBusiness extends BaseBusiness {

    public findById(id: any): Q.Promise<ChatViewedNoIOModel> {
        return this.database.model(ChatViewedNoSchema).findById(id)
            .then(result => new ChatViewedNoIOModel(result));
    }

    public save(model: ChatViewedNoIOModel): Q.Promise<ChatViewedNoIOModel> {
        var viewed = this.database.model(ChatViewedNoSchema);
        return Q.resolve(null)
            .then(() => {
                if (model._id != null)
                    return viewed.findById(model._id)
                        .then(_ => {
                            _.chats = model.chats;
                            return _;
                        });
                else {
                    var session = this.getComponent(SessionManerger);
                    var doc = viewed.toDocument(model);
                    doc._id = session.session.user._id;
                    return doc;
                }
            })
            .then(doc => {
                if (doc) {
                    return viewed.save(doc)
                        .then(result => new ChatViewedNoIOModel(result));
                }
                else
                    return null;
            });
    }
}

export default ChatViewedNoBusiness;
