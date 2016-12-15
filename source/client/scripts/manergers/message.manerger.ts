import {Injectable} from  "angular2/core";
import {Observable} from "rxjs/Rx";

import MessageService from "../services/message.http.service";
import MessageIOModel from "../../../common/models/io/common/message.io.model";

@Injectable()
class MessageManerger {
    private observable: Observable<MessageManerger>;
    private messages: Map<string, MessageIOModel> = new Map<string, MessageIOModel>();

    constructor(service: MessageService) {
        this.observable = Observable.create((observer) => {
            service.list()
                .map((response) => <MessageIOModel[]>response.models.messages)
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

    public getMessage(code: string, args?: string[]): MessageIOModel {
        if (this.messages.has(code)) {
            var messages: MessageIOModel = <MessageIOModel>Object
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
