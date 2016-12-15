import {Component, provide, OnInit} from  "angular2/core";

import {default as FormComponent, FORM_DIRECTIVES} from "../common/form.component";
import ChatService from "../../services/chat.socket.service";
import ChatIOModel from "../../../../common/models/io/chat/chat.io.model";
import {ChatSearchMessagesIOModel} from "../../../../common/models/io/chat/chat.message.io.model";
import Exception from "../../exceptions/exception";

@Component({
    selector: "chat-message-search",
    directives: [FORM_DIRECTIVES],
    viewProviders: [
        provide(FormComponent, { useExisting: ChatMessageSearchComponent })
    ],
    templateUrl: "scripts/components/chat/chat.message.search.html",
    inputs: ["chat"]
})
class ChatMessageSearchComponent extends FormComponent implements OnInit {
    private service: ChatService;
    private chat: ChatIOModel;
    private condition: string;

    private chatEvents = [];

    constructor(service: ChatService) {
        super();

        this.service = service;
    }

    public ngOnInit() {
        this.initService();
    }

    public ngOnDestroy() {
        this.chatEvents.forEach(_ => {
            this.service.off(_);
        });
    }

    private initService() {
        this.chatEvents.push(this.onFailure.bind(this));
        this.service.onFailure = this.chatEvents[0];
    }

    private onMessageKeyDown(event: KeyboardEvent) {
        if (event.keyCode == 13
            && event.ctrlKey) {
            // Ctrl + Enter
            if (this.condition) {
                this.search();
            }
            return false;
        }
        return true;
    }


    private search() {
        this.clearError();
        this.submit(() => {
            this.service.search(new ChatSearchMessagesIOModel(
                {
                    _id: this.chat._id,
                    condition: this.condition
                }
            ));
        });
    }

    private onFailure(error: Exception) {
        this.addError(error.errors);
    }

    public get hasError(): boolean {
        return super.hasError;
    }
}

export default ChatMessageSearchComponent;
