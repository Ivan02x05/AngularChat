import {Component} from  "angular2/core";

import UserManerger from "../../manergers/user.manerger";
import UserIOModel from "../../../../common/models/io/common/user.io.model";
import ChatIOModel from "../../../../common/models/io/chat/chat.io.model";
import {ChatMessageIOModel, ChatMessageDataIOModel} from "../../../../common/models/io/chat/chat.message.io.model";
import LinkPipe from "../../directives/link.pipe";

@Component({
    selector: "chat-message-list",
    templateUrl: "scripts/components/chat/chat.message.list.html",
    inputs: ["chat", "messages"],
    pipes: [LinkPipe]
})
class ChatMessageListComponent {
    private chat: ChatIOModel;
    private messages: ChatMessageIOModel[];
    private user: UserIOModel;

    constructor(manerger: UserManerger) {
        this.user = manerger.user;
    }

    private createMaterialsPath(message: ChatMessageDataIOModel): string {
        return "material/chat/files?code=" + this.chat.code + "&file=" + message.data;
    }
}

export default ChatMessageListComponent;
