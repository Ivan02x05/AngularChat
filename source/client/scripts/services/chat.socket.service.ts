import {Injectable} from  "angular2/core";

import SocketService from "./common/socket.service";
import {ChatIOModel} from "../../../common/models/io/chat/chat.io.model";
import {ChatMessagesIOModel, ChatMessageIOModel, ChatMessageDataIOModel,
    ChatAddMessageIOModel, ChatGetMessageListIOModel, ChatSearchMessagesIOModel}
from "../../../common/models/io/chat/chat.message.io.model";

@Injectable()
class ChatService extends SocketService {

    public connect() {
        this.initialize("chat");
    }

    public set onChatList(cb: (models: ChatIOModel[]) => void) {
        this.on("chatlist", (response) => {
            cb(response.models.chats
                .map(_ => new ChatIOModel(_)));
        });
    }

    public set onRegist(cb: (model: ChatIOModel) => void) {
        this.on("regist", (response) => {
            cb(new ChatIOModel(response.models.chat));
        });
    }

    public set onRegisted(cb: (model: ChatIOModel) => void) {
        this.on("regist", (response) => {
            if (response.models.fromself)
                cb(new ChatIOModel(response.models.chat));
        });
    }

    public set onUpdate(cb: (model: ChatIOModel) => void) {
        this.on("update", (response) => {
            cb(new ChatIOModel(response.models.chat));
        });
    }

    public set onUpdated(cb: (model: ChatIOModel) => void) {
        this.on("update", (response) => {
            if (response.models.fromself)
                cb(new ChatIOModel(response.models.chat));
        }, cb);
    }

    public set onDelete(cb: (model: ChatIOModel) => void) {
        this.on("delete", (response) => {
            cb(new ChatIOModel(response.models.chat));
        });
    }

    public set onAddMessage(cb: (chat: ChatIOModel, message: ChatMessageIOModel) => void) {
        this.on("addmessage", (response) => {
            cb(new ChatIOModel(response.models.chat),
                new ChatMessageIOModel(response.models.message));
        }, cb);
    }

    public set onJoin(cb: (chat: ChatIOModel, messages: ChatMessagesIOModel) => void) {
        this.on("join", (response) => {
            cb(new ChatIOModel(response.models.chat),
                new ChatMessagesIOModel(response.models.messages));
        }, cb);
    }

    public set onMessageList(cb: (model: ChatMessagesIOModel) => void) {
        this.on("messagelist", (response) => {
            cb(new ChatMessagesIOModel(response.models.messages));
        }, cb);
    }

    public set onMessageDailyList(cb: (model: ChatMessagesIOModel[]) => void) {
        this.on("messagedailylist", (response) => {
            cb(response.models.daily
                .map(_ => new ChatMessagesIOModel(_)));
        }, cb);
    }

    public set onDownload(cb: (model: ChatMessagesIOModel) => void) {
        this.on("download", (response) => {
            cb(new ChatMessagesIOModel(response.models.messages));
        }, cb);
    }

    public getChatList() {
        this.emit("chatlist");
    }

    public join(model: ChatIOModel) {
        this.emit("join", model);
    }

    public exit(model: ChatIOModel) {
        this.emit("exit", model);
    }

    public regist(model: ChatIOModel) {
        this.emit("regist", model);
    }

    public update(model: ChatIOModel) {
        this.emit("update", model);
    }

    public delete(model: ChatIOModel) {
        this.emit("delete", model);
    }

    public addMessage(model: ChatAddMessageIOModel) {
        this.emit("addmessage", model);
    }

    public getMessageList(model: ChatGetMessageListIOModel) {
        this.emit("messagelist", model);
    }

    public getMessageDailyList(model: ChatIOModel) {
        this.emit("messagedailylist", model);
    }

    public search(model: ChatSearchMessagesIOModel) {
        this.emit("search", model);
    }

    public download(model: ChatIOModel) {
        this.emit("download", model);
    }
}

export default ChatService;
