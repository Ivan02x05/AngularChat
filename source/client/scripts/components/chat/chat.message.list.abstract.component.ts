import {Input, OnInit, OnDestroy} from  "angular2/core";

import ChatService from "../../services/chat.socket.service";
import ChatIOModel from "../../../../common/models/io/chat/chat.io.model";
import {ChatMessagesIOModel, ChatMessageIOModel, ChatGetMessageListIOModel}
from "../../../../common/models/io/chat/chat.message.io.model";

import * as fileutil from "../../utils/file.util";

abstract class ChatMessageListAbstractComponent implements OnInit, OnDestroy {
    @Input() protected chat: ChatIOModel;
    @Input() protected messages: ChatMessagesIOModel;

    protected service: ChatService;

    protected chatEvents = [];
    protected connecting: boolean = false;

    constructor(service: ChatService) {
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

    protected initService() {
        this.chatEvents.push(this.onAddMessage.bind(this));
        this.service.onAddMessage = this.chatEvents[0];
    }

    protected onAddMessage(chat: ChatIOModel, message: ChatMessageIOModel): boolean {
        if (this.chat._id == chat._id) {
            this.messages.messages.unshift(message);
            return true;
        }
        else
            return false;
    }

    public abstract getMessagesList(): ChatMessageIOModel[];
}

export default ChatMessageListAbstractComponent;
