import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from  "angular2/core";

import {RouteParams} from  "angular2/router";

import ChatService from "../../services/chat.socket.service";
import {ChatIOModel} from "../../../../common/models/io/chat/chat.io.model";
import DivisionSaveIOModel from "../../../../common/models/io/common/division.save.io.model";
import {ChatMessagesIOModel, ChatMessageIOModel, ChatMessageDataIOModel}
from "../../../../common/models/io/chat/chat.message.io.model";

import ChatEditComponent from "./chat.edit.component";
import ChatMessageRegistComponent from "./chat.message.regist.component";
import ChatMessageSearchComponent from "./chat.message.search.component";
import ChatMessageListNormalComponent from "./chat.message.list.normal.component";
import ChatMessageListDailyComponent from "./chat.message.list.daily.component";
import ChatMessageListSearchComponent from "./chat.message.list.search.component";
import MessageManerger from "../../manergers/message.manerger";
import {ErrorConstant} from "../../../../common/constants/error.constant";
import {CodeConstant} from "../../../../common/constants/code.constant";
import * as fileutil from "../../utils/file.util";

enum Mode {
    Normal = 0,
    Daily,
    Search
}

@Component({
    directives: [
        ChatEditComponent,
        ChatMessageRegistComponent,
        ChatMessageSearchComponent,
        ChatMessageListNormalComponent,
        ChatMessageListDailyComponent,
        ChatMessageListSearchComponent
    ],
    templateUrl: "scripts/components/chat/chat.detail.html"
})
class ChatDetailComponent implements OnInit, OnDestroy {
    private id: string;
    private chat: ChatIOModel;
    private messages: ChatMessagesIOModel;
    private service: ChatService;
    private manerger: MessageManerger;

    private element: ElementRef;
    private mode: Mode = Mode.Normal;

    private toggled: boolean = true;
    private modes = Mode;
    private chatEvents = [];

    @ViewChild("inputCmp") private inputCmp: { hasError: boolean };
    @ViewChild("outputCmpl") private outputCmpl: { getDispMessage(): ChatMessageIOModel[] };
    @ViewChild("downloadBtn") private downloadBtn: ElementRef;

    constructor(service: ChatService, manerger: MessageManerger,
        routeParams: RouteParams, element: ElementRef) {

        this.service = service;
        this.manerger = manerger;
        this.id = routeParams.get("id");
        this.element = element;
    }

    public ngOnInit() {
        this.initService();
        this.service.join(new ChatIOModel(
            {
                _id: this.id
            }
        ));
    }

    public ngOnDestroy() {
        this.service.exit(new ChatIOModel(
            {
                _id: this.id
            }
        ));
        this.chatEvents.forEach(_ => {
            this.service.off(_);
        });
    }

    private initService() {
        this.chatEvents.push(this.onJoin.bind(this));
        this.service.onJoin = this.chatEvents[0];
        this.chatEvents.push(this.onUpdated.bind(this));
        this.service.onUpdated = this.chatEvents[1];
        this.chatEvents.push(this.onDownload.bind(this));
        this.service.onDownload = this.chatEvents[2];
        this.chatEvents.push(this.onAddMessage.bind(this));
        this.service.onAddMessageRoom = this.chatEvents[3];
    }

    private onAddMessage(message: ChatMessageIOModel) {
        this.messages.messages.unshift(message);
    }

    private onJoin(chat: ChatIOModel, messages: ChatMessagesIOModel) {
        this.chat = chat;
        this.messages = messages;
        if (this.chat.unread && this.chat.unread > 0) {
            this.messages.messages.splice(this.chat.unread, 0, new ChatMessageIOModel(
                {
                    message: new ChatMessageDataIOModel(
                        {
                            data: this.manerger.getMessage(ErrorConstant.Code.Info.UNREAD).message,
                            type: new DivisionSaveIOModel(
                                {
                                    subcode: CodeConstant.Division.SubCode.MessageType.UNREAD
                                }),
                            title: null
                        }
                    )
                }
            ));

            setTimeout(() => {
                // set scroll position
                const el = this.element.nativeElement;
                const list = el.querySelector(".chat-message-list");
                const unread = el.querySelector(".unread");
                list.scrollTop = unread.offsetTop - list.offsetHeight + unread.scrollHeight;
            }, 0);
        }
    }

    private onPushMessage(messages: ChatMessagesIOModel) {
        for (let message of messages.messages) {
            this.messages.messages.push(message);
            this.messages.unshown--;
        }
    }

    private onUpdated(chat: ChatIOModel) {
        this.toggled = true;
        this.chat = chat;
    }

    private toggle() {
        this.toggled = !this.toggled;
    }

    private onModeChange(mode: Mode) {
        this.mode = mode;
    }

    private get hasInputError(): boolean {
        if (this.inputCmp != null)
            return this.inputCmp.hasError;
        else
            return false;
    }

    private onDownloadDisped() {
        const anchor = this.downloadBtn.nativeElement;
        anchor.href = this.createCsvFile(this.outputCmpl.getDispMessage());
        anchor.click();
    }

    private onDownloadAll() {
        this.service.download(new ChatIOModel(
            {
                _id: this.id
            }
        ));
    }

    private onDownload(model: ChatMessagesIOModel) {
        const anchor = this.downloadBtn.nativeElement;
        anchor.href = this.createCsvFile(model.messages);
        anchor.click();
    }

    private onDownloadCommon() {
        setTimeout(() => {
            const anchor = this.downloadBtn.nativeElement;
            fileutil.deleteObjectUrl(anchor.href);
            anchor.href = "#";
        }, 0);
    }

    private createCsvFile(messages: ChatMessageIOModel[]): string {
        const data: any[][] = [];
        data.push(["ID", "タイトル", "公開範囲", "対象者", "種別", "メッセージ", "登録者", "日時"]);
        messages.forEach(_ => {
            data.push([
                this.chat._id,
                this.chat.title,
                this.chat.permission.value,
                this.chat.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.ALL ?
                    null : this.chat.users.map(u => u.fullname).join(","),
                _.message.type.value,
                _.message.isText ? _.message.data : _.message.title,
                _.user.fullname,
                _.time
            ]);
        });
        return fileutil.createCsvFile(data);
    }
}

export default ChatDetailComponent;
