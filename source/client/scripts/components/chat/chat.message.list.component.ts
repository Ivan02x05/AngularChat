import {Component} from  "angular2/core";

import UserManerger from "../../manergers/user.manerger";
import UserModel from "../../../../common/models/impl/common/user.model";
import ChatModel from "../../../../common/models/impl/chat/chat.model";
import {ChatMessageModel, ChatMessageDataModel} from "../../../../common/models/impl/chat/chat.message.model";
import LinkPipe from "../../directives/link.pipe";

@Component({
    selector: "chat-message-list",
    templateUrl: "scripts/components/chat/chat.message.list.html",
    inputs: ["chat", "messages"],
    pipes: [LinkPipe]
})
class ChatMessageListComponent {
    private chat: ChatModel;
    private messages: ChatMessageModel[];
    private user: UserModel;

    constructor(manerger: UserManerger) {
        this.user = manerger.user;
    }

    private createMaterialsPath(message: ChatMessageDataModel): string {
        return "material/chat/files?code=" + this.chat.code + "&file=" + message.data;
    }
}

export default ChatMessageListComponent;
