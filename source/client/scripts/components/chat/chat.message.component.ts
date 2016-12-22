import {Component, ChangeDetectionStrategy} from  "angular2/core";

import UserIOModel from "../../../../common/models/io/common/user.io.model";
import ChatIOModel from "../../../../common/models/io/chat/chat.io.model";
import {ChatMessageIOModel} from "../../../../common/models/io/chat/chat.message.io.model";
import LinkPipe from "../../directives/link.pipe";

@Component({
    selector: "chat-message",
    templateUrl: "scripts/components/chat/chat.message.html",
    inputs: ["chat", "message", "user"],
    pipes: [LinkPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ChatMessageComponent {
    private chat: ChatIOModel;
    private message: ChatMessageIOModel;
    private user: UserIOModel;

    private get materials(): string {
        return `material/chat/files?_id=${this.chat._id}&file=${this.message.message.data}`;
    }
}

export default ChatMessageComponent;
