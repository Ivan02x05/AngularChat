import {Injectable} from  "angular2/core";
import {Observable} from "rxjs/Rx";

import MessageService from "../services/message.http.service";
import MessageModel from "../../../common/models/impl/common/message.model";

@Injectable()
class MessageManerger {
    private observable: Observable<MessageManerger>;
    private messages: Map<string, MessageModel> = new Map<string, MessageModel>();

    constructor(service: MessageService) {
        this.observable = Observable.create((observer) => {
            service.list()
                .map((response) => <MessageModel[]>response.models.messages)
                .subscribe(
                (messages) => {
                    messages.map((message) => {
                        this.messages.set(message.code, message);
                    });
                    observer.next(this);
                    observer.complete();
                }
                );
        });
    }

    public initialize() {
        return this.observable;
    }

    public getMessage(code: string, args?: string[]): MessageModel {
        if (this.messages.has(code)) {
            var messages: MessageModel = <MessageModel>Object
                .assign({}, this.messages.get(code));

            if (args) {
                for (var i = 0; i < args.length; i++) {
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
