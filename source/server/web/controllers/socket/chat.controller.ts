import * as Q from "q";

import {default as SocketBaseController, ON_MESSAGE_MAP} from "../common/socket.base.controller";
import {controller, message} from "../common/controller.decorator";
import ChatService from "../../../service/chat.service";
import ServiceResult from "../../../service/common/service.result";
import UserModel from "../../../../common/models/impl/common/user.model";
import {ChatModel, ChatJoinModel} from "../../../../common/models/impl/chat/chat.model";
import ChatViewedNoModel from "../../../../common/models/impl/chat/chat.viewedno.model";
import {ChatMessagesModel, ChatMessageModel, ChatMessageDataModel,
    ChatAddMessageModel, ChatGetMessageListModel, ChatSearchMessagesModel} from "../../../../common/models/impl/chat/chat.message.model";
import ResponseModel from "../../../../common/models/impl/common/response.model";
import {CodeConstant} from "../../../../common/constants/code.constant";

var config = require("../../../common/resources/config/www/www.json");

const UN_ALLOCATED: number = -1;

@controller
class ChatController extends SocketBaseController {
    private static sockets: Map<number, ChatController[]> = new Map<number, ChatController[]>();
    private saveViewedInterval: number;
    public viewed: ChatViewedNoModel;

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
        super.onConnect();

        this.changeChat(UN_ALLOCATED, UN_ALLOCATED);

        // 閲覧履歴を保存する
        this.saveViewedInterval = setInterval(() => {
            this.saveViewed();
        }, 1000 * config.interval.saveViewd);
    }

    protected onDisconnect() {
        clearInterval(this.saveViewedInterval);

        ChatController.sockets.forEach((v, k) => {
            var index = v.indexOf(this);
            if (index >= 0)
                v.splice(index, 1);
        });

        return this.saveViewed()
            .then(() => {
                super.onDisconnect();
            });
    }

    protected onSessionTimeout(): Q.Promise<void> {
        return this.saveViewed()
            .then(() => super.onSessionTimeout());
    }

    @message({ services: [ChatService] })
    protected saveViewed(service?: ChatService): Q.Promise<void> {
        if (this.session)
            return service.close(this.viewed)
                .catch(() => { });
        else
            return Q.resolve<void>(null);
    }

    @message({ services: [ChatService] })
    protected onChatList(service?: ChatService): Q.Promise<void> {
        return service.getChatList()
            .then((result: ServiceResult) => {
                this.viewed = result.remove("viewed");
                this.emit("chatlist", result);
            });
    }

    @message({ model: ChatModel, services: [ChatService] })
    protected onRegist(model?: ChatModel, service?: ChatService): Q.Promise<void> {
        return service.regist(model)
            .then((result: ServiceResult) => this.resultToModel(result))
            .then(result => {
                var chat: ChatModel = result.models.chat;

                ChatController.sockets.forEach((v, k) => {
                    v.forEach(_ => {
                        if (chat.canView(_.session.user))
                            this.emits(_, "regist", result);
                    });
                });
            });
    }

    @message({ model: ChatModel, services: [ChatService] })
    protected onUpdate(model?: ChatModel, service?: ChatService): Q.Promise<void> {
        return service.update(model)
            .then((result: ServiceResult) => {

                var before = <ChatModel>result.get("before");
                var after = <ChatModel>result.get("after");
                var messages = <ChatMessagesModel>result.get("messages");

                ChatController.sockets.forEach((v, k) => {
                    v.forEach(_ => {
                        var user = _.session.user;
                        if (user.isAdmin) {
                            this.emits(_, "update", new ResponseModel({ models: { chat: after }, errors: null }));
                        } else {
                            if (before.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.LIMIT
                                && after.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.ALL) {
                                // limit → all
                                if (before.canView(user)) {
                                    // update
                                    this.emits(_, "update", new ResponseModel({ models: { chat: after }, errors: null }));
                                } else {
                                    // new
                                    var clone = Object.assign({}, after);
                                    clone.unread = _.viewed.countUnViewed(clone._id, messages.messages.map(__ => __._id));
                                    this.emits(_, "regist", new ResponseModel({ models: { chat: clone }, errors: null }));
                                }
                            } else if (before.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.ALL
                                && after.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.LIMIT) {
                                // all → limit
                                if (after.canView(user)) {
                                    // update
                                    this.emits(_, "update", new ResponseModel({ models: { chat: after }, errors: null }));
                                } else {
                                    // delete
                                    this.emits(_, "delete", new ResponseModel({ models: { chat: after }, errors: null }));
                                }
                            } else if (before.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.LIMIT
                                && after.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.LIMIT) {
                                // limit → limit
                                if (before.canView(user)) {
                                    if (after.canView(user)) {
                                        // update
                                        this.emits(_, "update", new ResponseModel({ models: { chat: after }, errors: null }));
                                    } else {
                                        // delete
                                        this.emits(_, "delete", new ResponseModel({ models: { chat: after }, errors: null }));
                                    }
                                } else {
                                    if (after.canView(user)) {
                                        // new
                                        var clone = Object.assign({}, after);
                                        clone.unread = _.viewed.countUnViewed(clone._id, messages.messages.map(__ => __._id));
                                        this.emits(_, "regist", new ResponseModel({ models: { chat: clone }, errors: null }));
                                    }
                                }
                            } else {
                                // all → all
                                // update
                                this.emits(_, "update", new ResponseModel({ models: { chat: after }, errors: null }));
                            }
                        }
                    });
                });
            });
    }

    @message({ model: ChatModel, services: [ChatService] })
    protected onDelete(model?: ChatModel, service?: ChatService): Q.Promise<void> {
        return service.delete(model)
            .then((result: ServiceResult) => this.resultToModel(result))
            .then(result => {
                var chat = <ChatModel>result.models.chat;
                ChatController.sockets.forEach((v, k) => {
                    v.forEach(_ => {
                        if (chat.canView(_.session.user)) {
                            this.emits(_, "delete", result);
                        }
                    });
                });
            });
    }

    @message({ model: ChatAddMessageModel, services: [ChatService] })
    protected onAddMessage(model?: ChatAddMessageModel, service?: ChatService): Q.Promise<void> {
        return service.addMessage(model)
            .then((result: ServiceResult) => {
                var chat = <ChatModel>result.get("chat");
                var message = <ChatMessageDataModel>result.get("message");

                ChatController.sockets.forEach((v, k) => {
                    v.forEach(_ => {
                        if (chat.canView(_.session.user)) {
                            if (k == chat.code)
                                _.viewed.chats.filter(v => v.chatId == chat._id)[0]
                                    .messageId = message._id;

                            this.emits(_, "addmessage", result);
                        }
                    });
                });
            });
    }

    @message({ model: ChatGetMessageListModel, services: [ChatService] })
    protected onMessageList(model?: ChatGetMessageListModel, service?: ChatService): Q.Promise<void> {
        return service.getMessageList(model)
            .then((result: ServiceResult) => {
                this.emit("messagelist", result);
            });
    }

    @message({ model: ChatJoinModel, services: [ChatService] })
    protected onMessageDailyList(model?: ChatJoinModel, service?: ChatService): Q.Promise<void> {
        return service.getMessageDailyList(model)
            .then((result: ServiceResult) => {
                this.emit("messagedailylist", result);
            });
    }

    @message({ model: ChatJoinModel, services: [ChatService] })
    protected onJoin(model?: ChatJoinModel, service?: ChatService): Q.Promise<void> {
        var vieweds = this.viewed.chats.filter(_ => _.code == model.code);
        var viewed;
        var readed: string;
        if (vieweds.length > 0) {
            viewed = vieweds[0];
            readed = viewed.messageId;
        }

        return service.join({ code: model.code, readed: readed })
            .then((result: ServiceResult) => {
                this.changeChat(UN_ALLOCATED, model.code);

                if (!viewed) {
                    var chat = <ChatModel>result.get("chat");
                    viewed = { chatId: chat._id, code: model.code };
                    this.viewed.chats.push(viewed);
                }

                var messages = <ChatMessagesModel>result.get("messages");
                if (messages.messages.length > 0)
                    viewed.messageId = messages.messages[0]._id;

                this.emit("join", result);
            });
    }

    @message({ model: ChatJoinModel })
    protected onExit(model?: ChatJoinModel): Q.Promise<void> {
        var sockets = ChatController.sockets.get(model.code);
        sockets.splice(sockets.indexOf(this), 1);
        ChatController.sockets.get(UN_ALLOCATED).push(this);
        return Q.resolve<void>(null);
    }

    @message({ model: ChatSearchMessagesModel, services: [ChatService] })
    protected onSearch(model?: ChatSearchMessagesModel, service?: ChatService): Q.Promise<void> {
        return service.search(model)
            .then((result: ServiceResult) => {
                this.emit("messagelist", result);
            });
    }

    @message({ model: ChatJoinModel, services: [ChatService] })
    protected onDownload(model?: ChatJoinModel, service?: ChatService): Q.Promise<void> {
        return service.download(model)
            .then((result: ServiceResult) => {
                this.emit("download", result);
            });
    }

    protected changeChat(before: number, after: number) {
        if (ChatController.sockets.has(before)) {
            var sockets = ChatController.sockets.get(before);
            var index = sockets.indexOf(this);
            if (index >= 0) {
                sockets.splice(index, 1);
            }
        }

        if (!ChatController.sockets.has(after))
            ChatController.sockets.set(after, []);

        ChatController.sockets.get(after).push(this);
    }
}

export default ChatController;
