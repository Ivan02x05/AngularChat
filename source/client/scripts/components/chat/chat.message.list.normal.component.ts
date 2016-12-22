import {Component, provide} from  "angular2/core";

import ChatService from "../../services/chat.socket.service";
import ChatIOModel from "../../../../common/models/io/chat/chat.io.model";
import {ChatMessagesIOModel, ChatMessageIOModel, ChatGetMessageListIOModel}
from "../../../../common/models/io/chat/chat.message.io.model";

import ChatMessageListAbstractComponent from "./chat.message.list.abstract.component";
import ChatMessageListComponent from "./chat.message.list.component";

@Component({
    directives: [ChatMessageListComponent],
    selector: "chat-message-list-normal",
    templateUrl: "scripts/components/chat/chat.message.list.normal.html"
})
class ChatMessageListNormalComponent extends ChatMessageListAbstractComponent {
    constructor(service: ChatService) {
        super(service);
    }

    protected initService() {
        super.initService();

        const index = this.chatEvents.length;
        this.chatEvents.push(this.onMessageList.bind(this));
        this.service.onMessageList = this.chatEvents[index + 0];
    }

    private getMessageList() {
        this.connecting = true;
        this.service.getMessageList(new ChatGetMessageListIOModel(
            {
                _id: this.chat._id,
                skip: this.messages.unshown
            }
        ));
    }

    private onMessageList(messages: ChatMessagesIOModel) {
        for (let m of messages.messages)
            this.messages.messages.push(m);

        this.messages.unshown = messages.unshown;
        this.connecting = false;
    }

    public getMessagesList(): ChatMessageIOModel[] {
        return this.messages.messages;
    }
}

export default ChatMessageListNormalComponent;
