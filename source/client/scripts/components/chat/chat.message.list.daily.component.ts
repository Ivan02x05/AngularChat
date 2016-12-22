import {Component, OnInit, OnDestroy, EventEmitter} from  "angular2/core";

import ChatService from "../../services/chat.socket.service";
import {ChatIOModel} from "../../../../common/models/io/chat/chat.io.model";
import {ChatMessagesIOModel, ChatMessageIOModel, ChatGetMessageListIOModel}
from "../../../../common/models/io/chat/chat.message.io.model";

import ChatMessageListComponent from "./chat.message.list.component";
import * as dateutil from "../../../../common/utils/date.util";

@Component({
    directives: [ChatMessageListComponent],
    selector: "chat-message-list-daily",
    templateUrl: "scripts/components/chat/chat.message.list.daily.html",
    inputs: ["chat", "messages"],
    outputs: ["onPushMessage"]
})
class ChatMessageListDailyComponent implements OnInit, OnDestroy {
    private chat: ChatIOModel;
    private messages: ChatMessagesIOModel;

    private onPushMessage: EventEmitter<ChatMessagesIOModel> =
    new EventEmitter<ChatMessagesIOModel>();

    private service: ChatService;

    private chatEvents = [];
    private dailymessages: ChatMessagesIOModel[] = [];
    private unpushed: ChatMessagesIOModel[] = [];

    constructor(service: ChatService) {
        this.service = service;
    }

    public ngOnInit() {
        this.initService();
        this.service.getMessageDailyList(new ChatIOModel(
            {
                _id: this.chat._id
            }
        ));
    }

    private initService() {
        this.chatEvents.push(this.onMessageDailyList.bind(this));
        this.service.onMessageDailyList = this.chatEvents[0];
        this.chatEvents.push(this.onMessageList.bind(this));
        this.service.onMessageList = this.chatEvents[1];
        this.chatEvents.push(this.onAddMessage.bind(this));
        this.service.onAddMessageRoom = this.chatEvents[2];
    }

    public ngOnDestroy() {
        this.chatEvents.forEach(_ => {
            this.service.off(_);
        });
    }

    private onAddMessage(message: ChatMessageIOModel) {
        if (this.dailymessages.length == 0
            || !dateutil.equals(this.dailymessages[0].date, dateutil.toYyyymmdd(message.time)))
            this.dailymessages.unshift(new ChatMessagesIOModel(
                {
                    _id: this.chat._id,
                    messages: [],
                    date: dateutil.toYyyymmdd(message.time)
                }
            ));
        this.dailymessages[0].messages.unshift(message);
    }

    private onMessageDailyList(daily: ChatMessagesIOModel[]) {
        let count = 0;
        this.dailymessages = daily;
        for (let day of this.dailymessages) {
            while (count < this.messages.messages.length) {
                const message = this.messages.messages[count];
                if (message.message.isUnread
                    || dateutil.equals(day.date, dateutil.toYyyymmdd(message.time))) {
                    day.messages.push(message);
                    if (!message.message.isUnread)
                        day.unshown--;
                } else
                    break;

                count++;
            }
        }
    }

    private getMessageList(model: ChatMessagesIOModel) {
        this.service.getMessageList(new ChatGetMessageListIOModel(
            {
                _id: model._id,
                date: model.date,
                skip: model.unshown
            }
        ));
    }

    private onMessageList(messages: ChatMessagesIOModel) {
        // 表示を更新
        const day = this.dailymessages.filter(_ => dateutil
            .equals(_.date, messages.date))[0];

        for (let message of messages.messages) {
            day.messages.push(message);
            day.unshown--;
        }

        // 退避 or 通知
        const unpushedbefore = this.unpushed.filter(_ => _.date >= day.date);
        let index = this.dailymessages.indexOf(day);
        if (unpushedbefore.length > 0 || (index > 0 && this.dailymessages[index - 1].unshown > 0)) {
            // 退避
            if (unpushedbefore.length == 0)
                this.unpushed.splice(0, 0, messages);
            else if (!dateutil.equals(unpushedbefore[0].date, day.date)) {
                index = this.unpushed.indexOf(unpushedbefore[0]);
                this.unpushed.splice(index + 1, 0, messages);
            } else {
                for (let message of messages.messages)
                    unpushedbefore[0].messages.push(message);
            }
        } else {
            // 通知
            const push = new ChatMessagesIOModel({
                messages: messages.messages
            });
            if (day.unshown == 0) {
                const unpushedafter = this.unpushed.filter(_ => _.date < day.date);
                for (let unpushed of unpushedafter) {
                    for (let message of unpushed.messages)
                        push.messages.push(message);

                    this.unpushed.splice(this.unpushed.indexOf(unpushed), 1);
                    if (unpushed.unshown > 0)
                        break;
                }
            }

            this.onPushMessage.next(push);
        }
    }

    public getDispMessage(): ChatMessageIOModel[] {
        const messages: ChatMessageIOModel[] = [];
        this.dailymessages.forEach(d => {
            d.messages.forEach(m => {
                messages.push(m);
            });
        });
        return messages;
    }
}

export default ChatMessageListDailyComponent;
