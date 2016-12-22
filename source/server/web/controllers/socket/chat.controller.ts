import * as Q from "q";

import {default as SocketBaseController, ON_MESSAGE_MAP, controller, message, scaleout} from "../common/socket.base.controller";
import ChatService from "../../../service/chat.service";
import ServiceResult from "../../../service/common/service.result";
import UserIOModel from "../../../../common/models/io/common/user.io.model";
import {ChatIOModel} from "../../../../common/models/io/chat/chat.io.model";
import ChatViewedNoIOModel from "../../../../common/models/io/chat/chat.viewedno.io.model";
import {ChatMessagesIOModel, ChatMessageIOModel, ChatMessageDataIOModel,
    ChatAddMessageIOModel, ChatGetMessageListIOModel, ChatSearchMessagesIOModel}
from "../../../../common/models/io/chat/chat.message.io.model";

import ResponseIOModel from "../../../../common/models/io/common/response.io.model";
import {CodeConstant} from "../../../../common/constants/code.constant";
import {SystemConstant} from "../../../common/constants/system.constant";
import {ChatRegistScaleoutModel, ChatUpdateScaleoutModel, ChatDeleteScaleoutModel}
from "../../scaleout/models/chat/chat.scaleout.model";
import {ChatMessageAddScaleoutModel} from "../../scaleout/models/chat/chat.message.scaleout.model";

const config = require("../../../common/resources/config/www/www.json");

@controller()
class ChatController extends SocketBaseController {
    private saveViewedInterval: number;
    private chatViewedNo: ChatViewedNoIOModel;

    protected initialize(): ON_MESSAGE_MAP {
        return {
            "chatlist": this.onChatList,
            "regist": this.onRegist,
            "update": this.onUpdate,
            "delete": this.onDelete,
            "addmessage": this.onAddMessage,
            "join": this.onJoin,
            "exit": this.onExit,
            "messagelist": this.onMessageList,
            "messagedailylist": this.onMessageDailyList,
            "search": this.onSearch,
            "download": this.onDownload
        };
    }

    protected onConnect() {
        return super.onConnect()
            .then(() =>
                Q.all(
                    [
                        this.subscribe(SystemConstant.Scaleout.Events.Subscribe.Chat.REGIST, this.onRegistSubscribe),
                        this.subscribe(SystemConstant.Scaleout.Events.Subscribe.Chat.UPDATE, this.onUpdateSubscribe),
                        this.subscribe(SystemConstant.Scaleout.Events.Subscribe.Chat.DELETE, this.onDeleteSubscribe),
                        this.subscribe(SystemConstant.Scaleout.Events.Subscribe.Chat.ADD_MESSAGE, this.onAddMessageSubscribe)
                    ]
                )
            )
            .then(() => {
                // 閲覧履歴を保存する
                this.saveViewedInterval = setInterval(() => {
                    this.saveViewed();
                }, 1000 * config.interval.saveViewd);
            });
    }

    protected onDisconnect() {
        clearInterval(this.saveViewedInterval);
        return this.saveViewed()
            .then(() => super.onDisconnect());
    }

    protected onSessionTimeout(): Q.Promise<void> {
        return this.saveViewed()
            .then(() => super.onSessionTimeout());
    }

    @message()
    protected saveViewed(service?: ChatService): Q.Promise<void> {
        if (this.session)
            return service.close(this.chatViewedNo)
                .catch(() => { });
        else
            return Q.fcall(() => { });
    }

    @message()
    protected onChatList(service?: ChatService): Q.Promise<void> {
        return service.getChatList()
            .then((result: ServiceResult) => {
                this.chatViewedNo = result.remove("viewed");
                this.emit("chatlist", result);
            });
    }

    @message()
    protected onRegist(model?: ChatIOModel, service?: ChatService): Q.Promise<void> {
        return service.regist(model)
            .then((result: ServiceResult) => {
                this.publish(SystemConstant.Scaleout.Events.Subscribe.Chat.REGIST,
                    new ChatRegistScaleoutModel({
                        chat: result.get("chat")
                    }));
            });
    }

    @scaleout()
    protected onRegistSubscribe(model: ChatRegistScaleoutModel): Q.Promise<void> {
        return Q.fcall(model.chat.canView.bind(model.chat), this.session.user)
            .then(flag => {
                if (!flag)
                    return;

                this.emit("regist", new ResponseIOModel({ models: { chat: model.chat }, errors: null }),
                    model.sender == this.socket.id);
            });
    }

    @message()
    protected onUpdate(model?: ChatIOModel, service?: ChatService): Q.Promise<void> {
        return service.update(model)
            .then((result: ServiceResult) => {
                this.publish(SystemConstant.Scaleout.Events.Subscribe.Chat.UPDATE,
                    new ChatUpdateScaleoutModel({
                        before: result.get("before"),
                        after: result.get("after"),
                        count: result.get("messages")
                    }));
            });
    }

    @scaleout()
    protected onUpdateSubscribe(model: ChatUpdateScaleoutModel): Q.Promise<void> {
        const emit = (event: string, unread: boolean = false) => {
            if (unread)
                model.after.unread = model.count;
            this.emit(event, new ResponseIOModel({ models: { chat: model.after }, errors: null }),
                model.sender == this.socket.id);
        }

        const isRegist = () => !model.before.canView(this.session.user)
            && model.after.canView(this.session.user);
        const isUpdate = () => model.before.canView(this.session.user)
            && model.after.canView(this.session.user);
        const isDelete = () => model.before.canView(this.session.user)
            && !model.after.canView(this.session.user);

        return Q.all([
            Q.fcall(isRegist.bind(this)),
            Q.fcall(isUpdate.bind(this)),
            Q.fcall(isDelete.bind(this))
        ]).spread((r: boolean, u: boolean, d: boolean) => {
            if (r)
                emit("regist", true);
            else if (u)
                emit("update");
            else if (d) {
                emit("delete");
                // 閲覧履歴をクリアする
                const viewed = this.chatViewedNo.chats.filter(_ => _.chatId == model.after._id);
                if (viewed.length > 0)
                    this.chatViewedNo.chats.splice(this.chatViewedNo
                        .chats.indexOf(viewed[0]), 1);
            }
        });
    }

    @message()
    protected onDelete(model?: ChatIOModel, service?: ChatService): Q.Promise<void> {
        return service.delete(model)
            .then((result: ServiceResult) => {
                this.publish(SystemConstant.Scaleout.Events.Subscribe.Chat.DELETE,
                    new ChatRegistScaleoutModel({
                        chat: result.get("chat")
                    }));
            });
    }

    @scaleout()
    protected onDeleteSubscribe(model: ChatDeleteScaleoutModel): Q.Promise<void> {
        return Q.fcall(model.chat.canView.bind(model.chat), this.session.user)
            .then(flag => {
                if (!flag)
                    return;

                this.emit("delete", new ResponseIOModel({ models: { chat: model.chat }, errors: null }),
                    model.sender == this.socket.id);
                // 閲覧履歴をクリアする
                const viewed = this.chatViewedNo.chats.filter(_ => _.chatId == model.chat._id);
                if (viewed.length > 0)
                    this.chatViewedNo.chats.splice(this.chatViewedNo
                        .chats.indexOf(viewed[0]), 1);
            });
    }

    @message()
    protected onAddMessage(model?: ChatAddMessageIOModel, service?: ChatService): Q.Promise<void> {
        return service.addMessage(model)
            .then((result: ServiceResult) => {
                this.publish(SystemConstant.Scaleout.Events.Subscribe.Chat
                    .ADD_MESSAGE, new ChatMessageAddScaleoutModel({
                        chat: <ChatIOModel>result.get("chat"),
                        message: <ChatMessageIOModel>result.get("message")
                    }));
            });
    }

    @scaleout()
    protected onAddMessageSubscribe(model: ChatMessageAddScaleoutModel): Q.Promise<void> {
        return Q.fcall(model.chat.canView.bind(model.chat), this.session.user)
            .then(flag => {
                if (!flag)
                    return;

                this.emit("addmessage", new ResponseIOModel({ models: { chat: model.chat, message: model.message }, errors: null }),
                    model.sender == this.socket.id);
            })
            .then(() => {
                const rooms = this.socket.rooms;
                for (var r in rooms) {
                    if (rooms[r] == model.chat._id) {
                        this.chatViewedNo.chats.filter(_ => _.chatId == model.chat._id)[0]
                            .messageId = model.message._id;

                        this.emit("addmessageroom", new ResponseIOModel({ models: { message: model.message }, errors: null }),
                            model.sender == this.socket.id);
                        break;
                    }
                }
            });
    }

    @message()
    protected onMessageList(model?: ChatGetMessageListIOModel, service?: ChatService): Q.Promise<void> {
        return service.getMessageList(model)
            .then((result: ServiceResult) => {
                this.emit("messagelist", result);
            });
    }

    @message()
    protected onMessageDailyList(model?: ChatIOModel, service?: ChatService): Q.Promise<void> {
        return service.getMessageDailyList(model)
            .then((result: ServiceResult) => {
                this.emit("messagedailylist", result);
            });
    }

    @message()
    protected onJoin(model?: ChatIOModel, service?: ChatService): Q.Promise<void> {
        const vieweds = this.chatViewedNo.chats.filter(_ => _.chatId == model._id);
        var viewed;
        var readed: string;
        if (vieweds.length > 0) {
            viewed = vieweds[0];
            readed = viewed.messageId;
        }

        return service.join({ id: model._id, readed: readed })
            .then((result: ServiceResult) => {
                return Q.nfcall(this.socket.join.bind(this.socket), model._id)
                    .then(() => {
                        if (!viewed) {
                            const chat = <ChatIOModel>result.get("chat");
                            viewed = { chatId: chat._id };
                            this.chatViewedNo.chats.push(viewed);
                        }

                        const messages = <ChatMessagesIOModel>result.get("messages");
                        if (messages.messages.length > 0)
                            viewed.messageId = messages.messages[0]._id;

                        this.emit("join", result);
                    });
            });
    }

    @message()
    protected onExit(model?: ChatIOModel): Q.Promise<void> {
        return Q.nfcall<void>(this.socket.leave.bind(this.socket), model._id);
    }

    @message()
    protected onSearch(model?: ChatSearchMessagesIOModel, service?: ChatService): Q.Promise<void> {
        return service.search(model)
            .then((result: ServiceResult) => {
                this.emit("messagelist", result);
            });
    }

    @message()
    protected onDownload(model?: ChatIOModel, service?: ChatService): Q.Promise<void> {
        return service.download(model)
            .then((result: ServiceResult) => {
                this.emit("download", result);
            });
    }
}

export default ChatController;
