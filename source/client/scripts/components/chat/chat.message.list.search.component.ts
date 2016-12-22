import {Component, OnInit, OnDestroy} from  "angular2/core";

import ChatService from "../../services/chat.socket.service";
import ChatIOModel from "../../../../common/models/io/chat/chat.io.model";
import {ChatMessagesIOModel, ChatMessageIOModel, ChatSearchMessagesIOModel}
from "../../../../common/models/io/chat/chat.message.io.model";

import ChatMessageListComponent from "./chat.message.list.component";

@Component({
    directives: [ChatMessageListComponent],
    selector: "chat-message-list-search",
    templateUrl: "scripts/components/chat/chat.message.list.search.html",
    inputs: ["chat, messages"]
})
class ChatMessageListSearchComponent implements OnInit, OnDestroy {
    private chat: ChatIOModel;
    private messages: ChatMessagesIOModel;

    private service: ChatService;

    private chatEvents = [];
    private search: ChatMessageIOModel[] = [];

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

    private onMessageList(messages: ChatMessagesIOModel) {
        this.search = messages.messages;
    }

    public getDispMessage(): ChatMessageIOModel[] {
        return this.search;
    }
}

export default ChatMessageListSearchComponent;
