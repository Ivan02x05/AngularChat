/// <reference path="../../../../typings/tsd.d.ts"/>

import * as Q from "q";

import MessageModel from "../../../common/models/impl/common/message.model";
import {lifecycle, LifeCycle, inject} from "../container/inject.decorator";
import DataBase from "../../database/database";
import MessageSchema from "../../database/schemas/message.schema";
import Container from "../../common/container/container";

@lifecycle(LifeCycle.Singleton)
@inject([{ clazz: DataBase }])
class MessageManerger {
    private static deferred: Q.Deferred<void> = Q.defer<void>();

    private _messages: Map<string, MessageModel> = new Map<string, MessageModel>();

    constructor(database?: DataBase) {
        this.create(database);
    }

    private create(database: DataBase) {
        database.model(MessageSchema)
            .find({ "systemColumn.deleteFlag": false })
            .then((data) => {
                data.forEach(_ => {
                    this.messages.set(_.code, new MessageModel(_));
                })
                MessageManerger.deferred.resolve();
            });
    }

    public static initialize(): Q.Promise<void> {
        Container.regist(MessageManerger);
        return MessageManerger.deferred.promise;
    }

    public getMessage(code: string, args?: string[]): MessageModel {
        if (this.messages.has(code)) {
            // clone
            var message: MessageModel = <MessageModel>Object
                .assign({}, this.messages.get(code));

            if (args) {
                for (var i = 0; i < args.length; i++) {
                    message.message = message.message
                        .replace("{" + i + "}", args[i]);
                }
            }
            return message;
        }
        else
            return null;
    }

    public get messages(): Map<string, MessageModel> {
        return this._messages;
    }
}

export default MessageManerger;
