import {Component, provide} from  "angular2/core";

import ChatService from "../../services/chat.socket.service";
import {ChatModel, ChatJoinModel} from "../../../../common/models/impl/chat/chat.model";
import {ChatMessagesModel, ChatMessageModel, ChatGetMessageListModel} from "../../../../common/models/impl/chat/chat.message.model";
import ChatMessageListAbstractComponent from "./chat.message.list.abstract.component";
import ChatMessageListComponent from "./chat.message.list.component";
import * as dateutil from "../../../../common/utils/date.util";

@Component({
    directives: [ChatMessageListComponent],
    selector: "chat-message-list-daily",
    templateUrl: "scripts/components/chat/chat.message.list.daily.html"
})
class ChatMessageListDailyComponent extends ChatMessageListAbstractComponent {
    private dailymessages: ChatMessagesModel[] = [];

    constructor(service: ChatService) {
        super(service);
    }

    public ngOnInit() {
        super.ngOnInit();

        this.service.getMessageDailyList(new ChatJoinModel(
            {
                code: this.chat.code
            }
        ));
    }

    public ngOnDestroy() {
        super.ngOnDestroy();

        this.updateMessages();
    }

    private updateMessages() {
        // clear
        this.messages.unshown = 0;
        this.messages.messages.splice(0, this.messages.messages.length);

        var straight = true;
        for (var day of this.dailymessages) {
            if (straight) {
                day.messages.forEach(_ => {
                    this.messages.messages.push(_);
                });
                if (day.unshown != null && day.unshown > 0) {
                    straight = false;
                    this.messages.unshown = day.unshown;
                }
            } else
                this.messages.unshown += (day.messages.length + day.unshown);
        }
        if (this.messages.unshown == 0)
            this.messages.unshown = null;
    }

    protected initService() {
        super.initService();

        var index = this.chatEvents.length;
        this.chatEvents.push(this.onMessageDailyList.bind(this));
        this.service.onMessageDailyList = this.chatEvents[index + 0];
        this.chatEvents.push(this.onMessageList.bind(this));
        this.service.onMessageList = this.chatEvents[index + 1];
    }

    protected onAddMessage(chat: ChatModel, message: ChatMessageModel): boolean {
        if (super.onAddMessage(chat, message)) {
            if (this.dailymessages.length == 0
                || !dateutil.equals(this.dailymessages[0].date, dateutil.toYyyymmdd(message.time)))
                this.dailymessages.unshift(new ChatMessagesModel(
                    {
                        _id: this.chat._id,
                        messages: [],
                        date: dateutil.toYyyymmdd(message.time)
                    }
                ));
            this.dailymessages[0].messages.unshift(message);
            return true;
        } else
            return false;
    }

    public onMessageDailyList(daily: ChatMessagesModel[]) {
        var count = 0;
        this.dailymessages = daily;
        for (var day of this.dailymessages) {
            while (count < this.messages.messages.length) {
                var message = this.messages.messages[count];
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

    public getMessageList(model: ChatMessagesModel) {
        this.connecting = true;
        this.service.getMessageList(new ChatGetMessageListModel(
            {
                _id: model._id,
                date: model.date,
                skip: model.unshown
            }
        ));
    }

    public onMessageList(messages: ChatMessagesModel) {
        this.connecting = false;

        var day = this.dailymessages.filter(_ => dateutil.equals(_.date, dateutil
            .toYyyymmdd(messages.messages[0].time)))[0];
        for (var message of messages.messages)
            day.messages.push(message);

        day.unshown = messages.unshown;
    }

    public getMessagesList(): ChatMessageModel[] {
        var messages: ChatMessageModel[] = [];
        this.dailymessages.forEach(d => {
            d.messages.forEach(m => {
                messages.push(m);
            });
        });
        return messages;
    }
}

export default ChatMessageListDailyComponent;
