import {Component} from  "angular2/core";

import UserManerger from "../../manergers/user.manerger";
import UserIOModel from "../../../../common/models/io/common/user.io.model";
import ChatIOModel from "../../../../common/models/io/chat/chat.io.model";
import {ChatMessageIOModel} from "../../../../common/models/io/chat/chat.message.io.model";
import ChatMessageComponent from "./chat.message.component";

@Component({
    selector: "chat-message-list",
    templateUrl: "scripts/components/chat/chat.message.list.html",
    inputs: ["chat", "messages"],
    directives: [ChatMessageComponent]
})
class ChatMessageListComponent {
    private chat: ChatIOModel;
    private messages: ChatMessageIOModel[];
    private user: UserIOModel;

    constructor(manerger: UserManerger) {
        this.user = manerger.user;
    }
}

export default ChatMessageListComponent;
