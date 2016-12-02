import {Injectable} from  "angular2/core";

import SocketService from "./common/socket.service";
import {ChatModel, ChatJoinModel} from "../../../common/models/impl/chat/chat.model";
import {ChatMessagesModel, ChatMessageModel, ChatMessageDataModel,
    ChatAddMessageModel, ChatGetMessageListModel, ChatSearchMessagesModel} from "../../../common/models/impl/chat/chat.message.model";

@Injectable()
class ChatService extends SocketService {

    public connect() {
        this.initialize("chat");
    }

    public set onChatList(cb: (models: ChatModel[]) => void) {
        this.on("chatlist", (response) => {
            cb(response.models.chats
                .map(_ => new ChatModel(_)));
        });
    }

    public set onRegist(cb: (model: ChatModel) => void) {
        this.on("regist", (response) => {
            cb(new ChatModel(response.models.chat));
        });
    }

    public set onRegisted(cb: (model: ChatModel) => void) {
        this.on("regist", (response) => {
            if (response.models.fromself)
                cb(new ChatModel(response.models.chat));
        });
    }

    public set onUpdate(cb: (model: ChatModel) => void) {
        this.on("update", (response) => {
            cb(new ChatModel(response.models.chat));
        });
    }

    public set onUpdated(cb: (model: ChatModel) => void) {
        this.on("update", (response) => {
            if (response.models.fromself)
                cb(new ChatModel(response.models.chat));
        }, cb);
    }

    public set onDelete(cb: (model: ChatModel) => void) {
        this.on("delete", (response) => {
            cb(new ChatModel(response.models.chat));
        });
    }

    public set onAddMessage(cb: (chat: ChatModel, message: ChatMessageModel) => void) {
        this.on("addmessage", (response) => {
            cb(new ChatModel(response.models.chat),
                new ChatMessageModel(response.models.message));
        }, cb);
    }

    public set onJoin(cb: (chat: ChatModel, messages: ChatMessagesModel) => void) {
        this.on("join", (response) => {
            cb(new ChatModel(response.models.chat),
                new ChatMessagesModel(response.models.messages));
        }, cb);
    }

    public set onMessageList(cb: (model: ChatMessagesModel) => void) {
        this.on("messagelist", (response) => {
            cb(new ChatMessagesModel(response.models.messages));
        }, cb);
    }

    public set onMessageDailyList(cb: (model: ChatMessagesModel[]) => void) {
        this.on("messagedailylist", (response) => {
            cb(response.models.daily
                .map(_ => new ChatMessagesModel(_)));
        }, cb);
    }

    public set onDownload(cb: (model: ChatMessagesModel) => void) {
        this.on("download", (response) => {
            cb(new ChatMessagesModel(response.models.messages));
        }, cb);
    }

    public getChatList() {
        this.emit("chatlist");
    }

    public join(model: ChatJoinModel) {
        this.emit("join", model);
    }

    public exit(model: ChatJoinModel) {
        this.emit("exit", model);
    }

    public regist(model: ChatModel) {
        this.emit("regist", model);
    }

    public update(model: ChatModel) {
        this.emit("update", model);
    }

    public delete(model: ChatModel) {
        this.emit("delete", model);
    }

    public addMessage(model: ChatAddMessageModel) {
        this.emit("addmessage", model);
    }

    public getMessageList(model: ChatGetMessageListModel) {
        this.emit("messagelist", model);
    }

    public getMessageDailyList(model: ChatJoinModel) {
        this.emit("messagedailylist", model);
    }

    public search(model: ChatSearchMessagesModel) {
        this.emit("search", model);
    }

    public download(model: ChatJoinModel) {
        this.emit("download", model);
    }
}

export default ChatService;
