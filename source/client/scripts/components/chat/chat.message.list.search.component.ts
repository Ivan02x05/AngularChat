import {Component, provide} from  "angular2/core";

import ChatService from "../../services/chat.socket.service";
import ChatModel from "../../../../common/models/impl/chat/chat.model";
import {ChatMessagesModel, ChatMessageModel, ChatSearchMessagesModel} from "../../../../common/models/impl/chat/chat.message.model";
import ChatMessageListAbstractComponent from "./chat.message.list.abstract.component";
import ChatMessageListComponent from "./chat.message.list.component";

@Component({
    directives: [ChatMessageListComponent],
    selector: "chat-message-list-search",
    templateUrl: "scripts/components/chat/chat.message.list.search.html"
})
class ChatMessageListSearchComponent extends ChatMessageListAbstractComponent {
    private search: ChatMessageModel[] = [];

    constructor(service: ChatService) {
        super(service);
    }

    protected initService() {
        super.initService();

        var index = this.chatEvents.length;
        this.chatEvents.push(this.onMessageList.bind(this));
        this.service.onMessageList = this.chatEvents[index + 0];
    }

    private onMessageList(messages: ChatMessagesModel) {
        this.search = messages.messages;
    }

    public getMessagesList(): ChatMessageModel[] {
        return this.search;
    }
}

export default ChatMessageListSearchComponent;
