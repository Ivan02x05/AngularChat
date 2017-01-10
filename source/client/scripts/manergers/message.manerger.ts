import {Injectable} from  "angular2/core";
import {Observable} from "rxjs/Rx";

import MessageService from "../services/message.http.service";
import MessageIOModel from "../../../common/models/io/common/message.io.model";

@Injectable()
class MessageManerger {
    private service: MessageService;
    private messages: Map<string, MessageIOModel> = new Map<string, MessageIOModel>();

    constructor(service: MessageService) {
        this.service = service;
    }

    public initialize(): Observable<MessageManerger> {
        return this.service.list()
            .map(response => response.models.messages
                .map(_ => new MessageIOModel(_)))
            .flatMap(messages => {
                messages.forEach(message => {
                    this.messages.set(message.code, message);
                });
                return Observable.of(this);
            })
    }

    public getMessage(code: string, args?: string[]): MessageIOModel {
        if (this.messages.has(code)) {
            const messages: MessageIOModel = <MessageIOModel>Object
                .assign({}, this.messages.get(code));

            if (args) {
                for (let i = 0; i < args.length; i++) {
                    messages.message = messages.message
                        .replace("{" + i + "}", args[i]);
                }
            }
            return messages;
        }
        else
            return null;
    }
}

export default MessageManerger;
