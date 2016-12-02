import {Component, provide, OnInit, OnDestroy, ViewChild, ElementRef} from  "angular2/core";
import {RouteParams} from  "angular2/router";

import ChatService from "../../services/chat.socket.service";
import {default as ChatModel, ChatJoinModel} from "../../../../common/models/impl/chat/chat.model";
import ErrorModel from "../../../../common/models/impl/common/error.model";
import DivisionSaveModel from "../../../../common/models/impl/common/division.save.model";
import {default as ChatMessagesModel, ChatMessageModel, ChatMessageDataModel} from "../../../../common/models/impl/chat/chat.message.model";
import ChatEditComponent from "./chat.edit.component";
import ChatMessageRegistComponent from "./chat.message.regist.component";
import ChatMessageSearchComponent from "./chat.message.search.component";
import ChatMessageListAbstractComponent from "./chat.message.list.abstract.component";
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
    private element: ElementRef;
    private code: number;
    private chat: ChatModel;
    private messages: ChatMessagesModel;
    private service: ChatService;
    private manerger: MessageManerger;
    private toggled: boolean = true;
    private modes = Mode;
    private mode: Mode = Mode.Normal;
    private chatEvents = [];
    protected downloading: boolean = false;

    @ViewChild("inputCmp") private inputCmp: { hasError: boolean };
    @ViewChild("outputCmpl") private outputCmpl: ChatMessageListAbstractComponent;
    @ViewChild("downloadBtn") private downloadBtn: ElementRef;

    constructor(service: ChatService, manerger: MessageManerger,
        routeParams: RouteParams, element: ElementRef) {

        this.service = service;
        this.manerger = manerger;
        this.code = Number(routeParams.get("code"));
        this.element = element;
    }

    public ngOnInit() {
        this.initService();
        this.service.join(new ChatJoinModel(
            {
                code: this.code
            }
        ));
    }

    public ngOnDestroy() {
        this.service.exit(new ChatJoinModel(
            {
                code: this.code
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
    }

    private onJoin(chat: ChatModel, messages: ChatMessagesModel) {
        this.chat = chat;
        this.messages = messages;
        if (this.chat.unread && this.chat.unread > 0) {
            this.messages.messages.splice(this.chat.unread, 0, new ChatMessageModel(
                {
                    message: new ChatMessageDataModel(
                        {
                            data: this.manerger.getMessage(ErrorConstant.Code.Info.UNREAD).message,
                            type: new DivisionSaveModel(
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
                var el = this.element.nativeElement;
                var list = el.querySelector(".chat-message-list");
                var unread = el.querySelector(".unread");
                list.scrollTop = unread.offsetTop - list.offsetHeight + unread.scrollHeight;
            }, 0);
        }
    }

    private onUpdated(chat: ChatModel) {
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
        var anchor = this.downloadBtn.nativeElement;
        anchor.href = this.createCsvFile(this.outputCmpl.getMessagesList());
        anchor.click();
    }

    private onDownloadAll() {
        this.downloading = true;
        this.service.download(new ChatJoinModel(
            {
                code: this.chat.code
            }
        ));
    }

    private onDownload(model: ChatMessagesModel) {
        this.downloading = true;
        var anchor = this.downloadBtn.nativeElement;
        anchor.href = this.createCsvFile(model.messages);
        anchor.click();
    }

    private onDownloadCommon() {
        setTimeout(() => {
            var anchor = this.downloadBtn.nativeElement;
            fileutil.deleteObjectUrl(anchor.href);
            anchor.href = "#";
            this.downloading = false;
        }, 0);
    }

    private createCsvFile(messages: ChatMessageModel[]): string {
        var data: any[][] = [];
        data.push(["コード", "タイトル", "公開範囲", "対象者", "種別", "メッセージ", "登録者", "日時"]);
        messages.forEach(_ => {
            data.push([
                this.chat.code,
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