import {Component, EventEmitter, OnInit, OnDestroy} from  "angular2/core";

import ChatService from "../../services/chat.socket.service";
import ChatIOModel from "../../../../common/models/io/chat/chat.io.model";
import {ChatMessagesIOModel, ChatMessageIOModel, ChatGetMessageListIOModel}
from "../../../../common/models/io/chat/chat.message.io.model";

import ChatMessageListComponent from "./chat.message.list.component";

@Component({
    directives: [ChatMessageListComponent],
    selector: "chat-message-list-normal",
    templateUrl: "scripts/components/chat/chat.message.list.normal.html",
    inputs: ["chat", "messages"],
    outputs: ["onPushMessage"]
})
class ChatMessageListNormalComponent implements OnInit, OnDestroy {
    private chat: ChatIOModel;
    private messages: ChatMessagesIOModel;

    private onPushMessage: EventEmitter<ChatMessagesIOModel> =
    new EventEmitter<ChatMessagesIOModel>();

    private service: ChatService;

    private chatEvents = [];

    constructor(service: ChatService) {
        this.service = service;
    }

    public ngOnInit() {
        this.initService();
    }

    private initService() {
        this.chatEvents.push(this.onMessageList.bind(this));
        this.service.onMessageList = this.chatEvents[0];
    }

    public ngOnDestroy() {
        this.chatEvents.forEach(_ => {
            this.service.off(_);
        });
    }

    private getMessageList() {
        this.service.getMessageList(new ChatGetMessageListIOModel(
            {
                _id: this.chat._id,
                skip: this.messages.unshown
            }
        ));
    }

    private onMessageList(messages: ChatMessagesIOModel) {
        this.onPushMessage.next(messages);
    }

    public getDispMessage(): ChatMessageIOModel[] {
        return this.messages.messages;
    }
}

export default ChatMessageListNormalComponent;
