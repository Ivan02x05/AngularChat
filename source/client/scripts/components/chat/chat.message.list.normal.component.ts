import {Component, provide} from  "angular2/core";

import ChatService from "../../services/chat.socket.service";
import ChatModel from "../../../../common/models/impl/chat/chat.model";
import {ChatMessagesModel, ChatMessageModel, ChatGetMessageListModel} from "../../../../common/models/impl/chat/chat.message.model";
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

        var index = this.chatEvents.length;
        this.chatEvents.push(this.onMessageList.bind(this));
        this.service.onMessageList = this.chatEvents[index + 0];
    }

    private getMessageList() {
        this.connecting = true;
        this.service.getMessageList(new ChatGetMessageListModel(
            {
                _id: this.chat._id,
                skip: this.messages.unshown
            }
        ));
    }

    private onMessageList(messages: ChatMessagesModel) {
        for (var m of messages.messages)
            this.messages.messages.push(m);

        this.messages.unshown = messages.unshown;
        this.connecting = false;
    }

    public getMessagesList(): ChatMessageModel[] {
        return this.messages.messages;
    }
}

export default ChatMessageListNormalComponent;
