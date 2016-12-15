import * as Q from "q";

import MessageIOModel from "../../../common/models/io/common/message.io.model";
import {lifecycle, LifeCycle, inject} from "../container/inject.decorator";
import DataBase from "../../database/database";
import MessageSchema from "../../database/schemas/message.schema";
import Container from "../../common/container/container";

@lifecycle(LifeCycle.Singleton)
class MessageManerger {
    private _messages: Map<string, MessageIOModel> = new Map<string, MessageIOModel>();

    public initialize(): Q.Promise<void> {
        return this.create();
    }

    @inject([{ clazz: DataBase }])
    private create(database?: DataBase): Q.Promise<void> {
        return database.model(MessageSchema)
            .find({ "systemColumn.deleteFlag": false })
            .then((data) => {
                data.forEach(_ => {
                    this.messages.set(_.code, new MessageIOModel(_));
                })
            })
    }

    public getMessage(code: string, args?: string[]): MessageIOModel {
        if (this.messages.has(code)) {
            // clone
            var message: MessageIOModel = <MessageIOModel>Object
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

    public get messages(): Map<string, MessageIOModel> {
        return this._messages;
    }
}

export default MessageManerger;
