/// <reference path="../../../typings/tsd.d.ts"/>

import * as Q from "q";

import BaseBusiness from "./common/base.business";
import ChatViewedNoSchema from "../database/schemas/chat.viewedno.schema";
import ChatViewedNoModel from "../../common/models/impl/chat/chat.viewedno.model";
import SessionManerger from "../common/manergers/session.manerger";

class ChatViewedNoBusiness extends BaseBusiness {

    public findById(id: any): Q.Promise<ChatViewedNoModel> {
        return this.database.model(ChatViewedNoSchema).findById(id)
            .then(result => new ChatViewedNoModel(result));
    }

    public save(model: ChatViewedNoModel): Q.Promise<ChatViewedNoModel> {
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
                        .then(result => new ChatViewedNoModel(result));
                }
                else
                    return null;
            });
    }
}

export default ChatViewedNoBusiness;
