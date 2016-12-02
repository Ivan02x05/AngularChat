import {Component} from  "angular2/core";

import ChatEditComponent from "./chat.edit.component";

@Component({
    directives: [ChatEditComponent],
    templateUrl: "scripts/components/chat/chat.new.html"
})
class ChatNewComponent {
}

export default ChatNewComponent;
