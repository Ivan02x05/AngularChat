
import {Component, provide, OnInit, OnDestroy, Pipe, PipeTransform} from  "angular2/core";
import {Router, RouteConfig, RouterOutlet, CanActivate} from  "angular2/router";

import {FORM_DIRECTIVES} from "../common/form.component";
import ChatService from "../../services/chat.socket.service";
import ChatModel from "../../../../common/models/impl/chat/chat.model";
import {ChatMessageModel} from "../../../../common/models/impl/chat/chat.message.model";
import ChatNewComponent from "./chat.new.component";
import ChatDetailComponent from "./chat.detail.component";
import ChatDefaultComponent from "./chat.default.component";
import UserManerger from "../../manergers/user.manerger";
import NotificationManerger from "../../manergers/notification.manerger";

@Pipe({
    name: "chatfilter",
    pure: false
})
class ChatFilterPipe implements PipeTransform {
    public transform(chats: ChatModel[], filters: string[]) {
        if (filters.length == 0
            || filters[0] == null)
            return chats;

        var filter = ".*" + filters[0] + ".*";
        return chats.filter(_ => _.title.match(filter) != null);
    }
}

@RouteConfig([
    {
        useAsDefault: true,
        path: "/default",
        name: "Default",
        component: ChatDefaultComponent
    },
    {
        path: "/new",
        name: "New",
        component: ChatNewComponent
    },
    {
        path: "/:code",
        name: "Detail",
        component: ChatDetailComponent
    }
])
@Component({
    directives: [RouterOutlet, FORM_DIRECTIVES],
    providers: [ChatService],
    viewProviders: [
        provide(ChatService, { useExisting: ChatService })
    ],
    templateUrl: "scripts/components/chat/chat.top.html",
    pipes: [ChatFilterPipe]
})
@CanActivate((next, prev) => UserManerger.authenticated)
class ChatTopComponent implements OnInit, OnDestroy {
    private service: ChatService;

    private notification: NotificationManerger;
    private chats: ChatModel[] = [];
    private router: Router;
    private filter: string;

    private chatEvents = [];

    constructor(service: ChatService, router: Router, notification: NotificationManerger) {
        this.service = service;
        this.router = router;
        this.notification = notification;
    }

    public ngOnInit() {
        this.initService();
        this.service.getChatList();
    }

    public ngOnDestroy() {
        this.service.close();
    }

    private initService() {
        this.service.connect();

        this.chatEvents.push(this.onChatList.bind(this));
        this.service.onChatList = this.chatEvents[0];
        this.chatEvents.push(this.onRegisted.bind(this));
        this.service.onRegisted = this.chatEvents[1];
        this.chatEvents.push(this.onRegist.bind(this));
        this.service.onRegist = this.chatEvents[2];
        this.chatEvents.push(this.onUpdate.bind(this));
        this.service.onUpdate = this.chatEvents[3];
        this.chatEvents.push(this.onDelete.bind(this));
        this.service.onDelete = this.chatEvents[4];
        this.chatEvents.push(this.onAddMessage.bind(this));
        this.service.onAddMessage = this.chatEvents[5];
    }

    private onChatList(chats: ChatModel[]) {
        this.chats = chats;
    }

    private onRegist(chat: ChatModel) {
        this.chats.unshift(chat);
        this.notification.notification(chat.title, "グループ追加", () => {
            this.select(chat);
        });
    }

    private onRegisted(chat: ChatModel) {
        var original = this.chats.filter(_ => _._id == chat._id);
        if (original.length > 0)
            this.select(original[0]);
        else
            setTimeout(() => {
                this.onRegisted(chat);
            }, 0);
    }

    private onDelete(chat: ChatModel) {
        var original = this.chats.filter(_ => _._id == chat._id)[0];
        this.chats.splice(this.chats.indexOf(original), 1);
        if (original.active)
            this.router.navigate(["Default"]);

        this.notification.notification(original.title, "グループ削除");
    }

    private onUpdate(chat: ChatModel) {
        var original = this.chats.filter(_ => _._id == chat._id)[0];
        var index = this.chats.indexOf(original);
        chat.unread = original.unread;
        chat.active = original.active;
        this.chats[index] = chat;

        this.notification.notification(chat.title, "グループ更新", () => {
            if (!chat.active)
                this.select(chat);
        });
    }

    private onAddMessage(chat: ChatModel, message: ChatMessageModel) {
        var original = this.chats.filter(_ => _._id == chat._id)[0];
        if (!original.active)
            if (!original.unread)
                original.unread = 1;
            else
                original.unread += 1;

        this.notification.notification(chat.title,
            message.message4notification, () => {
                this.select(original);
            });
    }

    private create() {
        this.clearActive();
        this.router.navigate(["New"]);
    }

    private select(chat: ChatModel) {
        this.clearActive();
        chat.active = true;
        chat.unread = null;
        this.router.navigate(["Detail", { code: chat.code }]);
    }

    private onTop() {
        this.clearActive();
    }

    private clearActive() {
        this.chats.filter(_ => _.active)
            .forEach(_ => {
                _.active = false;
            });
    }
}

export default ChatTopComponent;
