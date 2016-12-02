/// <reference path="../../../typings/tsd.d.ts"/>

import * as Q from "q";

import BaseBusiness from "./common/base.business";
import ChatSchema from "../database/schemas/chat.schema";
import ChatModel from "../../common/models/impl/chat/chat.model";
import UserModel from "../../common/models/impl/common/user.model";
import {ErrorConstant} from "../../common/constants/error.constant";
import {CodeConstant} from "../../common/constants/code.constant";
import {DataBaseConstant} from "../common/constants/database.constant";
import Exception from "../common/exceptions/exception";
import UserBusiness from "./user.business";
import SequenceBusiness from "./sequence.business";

class ChatBusiness extends BaseBusiness {
    public getPermissionChats(user: UserModel): Q.Promise<ChatModel[]> {
        var cond = { "systemColumn.deleteFlag": false };
        if (!user.isAdmin)
            cond["$or"] = [
                { "permission.subcode": CodeConstant.Division.SubCode.AccessPermission.ALL },
                { "users._id": user._id }
            ];
        var options = { sort: { code: -1 } };

        return this.database.model(ChatSchema)
            .find(cond, null, options)
            .then(result => result.map(_ => new ChatModel(_)));
    }

    public findById(id: any): Q.Promise<ChatModel> {
        return this.database.model(ChatSchema)
            .findById(id)
            .then(result => {
                if (result && !result.systemColumn.deleteFlag)
                    return new ChatModel(result);
                else
                    return null;
            });
    }

    public findByCode(code: number): Q.Promise<ChatModel> {
        return this.database.model(ChatSchema)
            .find({ code: code, "systemColumn.deleteFlag": false })
            .then(result => result.length > 0 ? new ChatModel(result[0]) : null);
    }

    public regist(model: ChatModel): Q.Promise<ChatModel> {
        var chats = this.database.model(ChatSchema);
        return this.getComponent(SequenceBusiness)
            .next(DataBaseConstant.Sequence.CHAT)
            .then(sequence => {
                model.code = sequence;
                var chat = chats.toDocument(model);
                if (chat.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.ALL)
                    chat.users = null;

                return chats.save(chat);
            })
            .then(result => new ChatModel(result));
    }

    public update(model: ChatModel): Q.Promise<ChatModel> {
        var chats = this.database.model(ChatSchema);
        return chats
            .findById(model._id)
            .then(_ => {
                _.title = model.title;
                _.permission = model.permission;
                if (_.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.ALL)
                    _.users = null;
                else
                    _.users = model.users;
                _.systemColumn.version = model.systemColumn.version;
                return chats.save(_);
            })
            .then(result => new ChatModel(result));
    }

    public delete(model: ChatModel): Q.Promise<ChatModel> {
        return this.database.model(ChatSchema)
            .delete(model)
            .then(result => new ChatModel(result));
    }
}

export default ChatBusiness;
