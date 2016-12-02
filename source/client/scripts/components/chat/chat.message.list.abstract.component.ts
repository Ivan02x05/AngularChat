import {Input, OnInit, OnDestroy} from  "angular2/core";

import ChatService from "../../services/chat.socket.service";
import ChatModel from "../../../../common/models/impl/chat/chat.model";
import {ChatMessagesModel, ChatMessageModel, ChatGetMessageListModel} from "../../../../common/models/impl/chat/chat.message.model";
import * as fileutil from "../../utils/file.util";

abstract class ChatMessageListAbstractComponent implements OnInit, OnDestroy {
    @Input() protected chat: ChatModel;
    @Input() protected messages: ChatMessagesModel;

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

    protected onAddMessage(chat: ChatModel, message: ChatMessageModel): boolean {
        if (this.chat._id == chat._id) {
            this.messages.messages.unshift(message);
            return true;
        }
        else
            return false;
    }

    public abstract getMessagesList(): ChatMessageModel[];
}

export default ChatMessageListAbstractComponent;
