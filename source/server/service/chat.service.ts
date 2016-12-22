import * as Q from "q";
import * as path from "path";

import BaseService from "./common/base.service";
import {service, method} from "./common/service.decorator";
import UserIOModel from "../../common/models/io/common/user.io.model";
import UserInfoIOModel from "../../common/models/io/common/user.info.io.model";
import {ChatIOModel} from "../../common/models/io/chat/chat.io.model";
import ChatViewedNoIOModel from "../../common/models/io/chat/chat.viewedno.io.model";
import {ChatMessagesIOModel, ChatMessageIOModel, ChatMessageDataIOModel, ChatAddMessageIOModel,
    ChatGetMessageListIOModel, ChatSearchMessagesIOModel, ChatGetMessagesMaterialIOModel}
from "../../common/models/io/chat/chat.message.io.model";

import ChatBusiness from "../business/chat.business";
import ChatViewedNoBusiness from "../business/chat.viewedno.business";
import ChatMessageBusiness from "../business/chat.message.business";
import SessionManerger from "../common/manergers/session.manerger";
import {ErrorConstant} from "../../common/constants/error.constant";
import Exception from "../common/exceptions/exception";
import * as fileutil from "../common/utils/file.util";

const config = require("../common/resources/config/www/www.json");

@service
class ChatService extends BaseService {

    @method()
    public getChatList(): Q.Promise<any> {
        const result = this.result;
        const chatBusiness = this.getComponent(ChatBusiness);
        const viewedNoBusiness = this.getComponent(ChatViewedNoBusiness);
        const messageBusiness = this.getComponent(ChatMessageBusiness);
        const session = this.getComponent(SessionManerger);

        return Q.all<any>(
            [
                chatBusiness.getPermissionChats(session.session.user),
                viewedNoBusiness.findById(session.session.user._id)
            ]
        )
            .then(data => {
                return {
                    chats: <ChatIOModel[]>data[0],
                    viewed: <ChatViewedNoIOModel>data[1]
                };
            })
            .then(data => {
                const chats = data.chats;
                const viewed = data.viewed;
                result.add("chats", chats);
                result.add("viewed", viewed);

                if (chats.length == 0)
                    return;

                return Q.all<void>(chats.map(_ => {
                    const v = viewed.chats.filter(__ => __.chatId == _._id);
                    const cond: any = { chatId: _._id };
                    if (v.length != 0)
                        cond.messageId = v[0].messageId;

                    return messageBusiness.findByIdMessageIndex(cond)
                        .then(index => index.total - (index.index != null ? (index.index + 1) : 0))
                        .then(index => (v.length == 0 || index > 0) ? index : null)
                        .then(index => {
                            _.unread = index;
                        });
                }));
            });
    }

    @method()
    public join(model: { id: number, readed?: any }): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(ChatMessageBusiness);

        return this.canView(model.id)
            .then(_ => {
                result.add("chat", _);
                return _;
            })
            .then(chat => {
                return business.findByIdMessageIndex({ chatId: chat._id, messageId: model.readed })
                    .then(index => {
                        return {
                            chat: chat,
                            index: index
                        };
                    })
            })
            .then(data => {
                const count = data.index.total - (data.index.index != null ? (data.index.index + 1) : 0);
                if (count != 0)
                    data.chat.unread = count;

                return business.findByIdSelectMessages({ id: data.chat._id, count: count })
                    .then(select => {
                        return {
                            index: data.index,
                            select: new ChatMessagesIOModel(select)
                        };
                    })
            })
            .then(data => {
                data.select.unshown = data.index.total - data.select.messages.length;
                if (data.select.unshown <= 0)
                    data.select.unshown = null;
                return data.select;
            })
            .then(messages => {
                result.add("messages", messages);
            });
    }

    @method()
    public getMessageList(model: ChatGetMessageListIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(ChatMessageBusiness);

        return this.canView(model._id)
            .then(_ => business.findByIdSelectMessages({ id: model._id, skip: model.skip, date: model.date }))
            .then(_ => new ChatMessagesIOModel(_))
            .then(_ => {
                result.add("messages", _);
            });
    }

    @method()
    public getMessageDailyList(model: ChatIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(ChatMessageBusiness);

        return this.canView(model._id)
            .then(_ => business.findByIdGroupByDate(_._id))
            .then(_ => _.map(__ => new ChatMessagesIOModel(
                {
                    _id: __._id,
                    unshown: __.count,
                    messages: [],
                    date: __.date
                }
            )))
            .then(_ => {
                result.add("daily", _);
            });
    }

    @method()
    public regist(model: ChatIOModel): Q.Promise<any> {
        const result = this.result;
        const chatBusiness = this.getComponent(ChatBusiness);
        const messageBusiness = this.getComponent(ChatMessageBusiness);

        return chatBusiness.regist(model)
            .then(_ => {
                _.unread = 0;
                result.add("chat", _);
                return messageBusiness.regist(_._id);
            });
    }

    @method()
    public update(model: ChatIOModel): Q.Promise<any> {
        const result = this.result;
        const chatBusiness = this.getComponent(ChatBusiness);
        const messageBusiness = this.getComponent(ChatMessageBusiness);

        return this.canUpdate(model._id)
            .then(_ => {
                result.add("before", _);
                return _;
            })
            .then(() => chatBusiness.update(model))
            .then(_ => {
                result.add("after", _);
                return _;
            })
            .then(_ => messageBusiness.findByIdMessageIndex({ chatId: _._id }))
            .then(_ => {
                result.add("messages", _.total != null ? _.total : 0);
            });
    }

    @method()
    public delete(model: ChatIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(ChatBusiness);

        return this.canUpdate(model._id)
            .then(_ => business.delete(_))
            .then(_ => {
                result.add("chat", _);
            });
    }

    @method()
    public close(model: ChatViewedNoIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(ChatViewedNoBusiness);
        const session = this.getComponent(SessionManerger);

        if (model._id == null)
            model._id = session.session.user._id;

        return business.save(model)
            .then(_ => {
                result.add("viewed", _);
            });
    }

    @method()
    public addMessage(model: ChatAddMessageIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(ChatMessageBusiness);
        const session = this.getComponent(SessionManerger);

        return this.canView(model._id)
            .then(_ => {
                return business.addMessage(model._id,
                    new ChatMessageIOModel(
                        {
                            message: model.message,
                            user: new UserInfoIOModel(session.session.user)
                        }
                    ))
                    .then(__ => {
                        return {
                            chat: _,
                            message: __
                        };
                    })
            })
            .then(_ => {
                result.add("chat", _.chat);
                result.add("message", _.message);
                return _;
            })
            .then(_ => {
                if (!_.message.message.isText)
                    return fileutil.writeFileFromBase64Url({
                        url: model.message.data,
                        path: path.join(config.material.chat.path, _.chat._id),
                        name: _.message.message.data
                    })
            });
    }

    @method()
    public search(model: ChatSearchMessagesIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(ChatMessageBusiness);

        return this.canView(model._id)
            .then(_ => business.findByIdMessageSearch({ id: model._id, condition: model.condition }))
            .then(_ => new ChatMessagesIOModel(_))
            .then(_ => {
                result.add("messages", _);
            });
    }

    @method()
    public download(model: ChatIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(ChatMessageBusiness);

        return this.canView(model._id)
            .then(_ => business.findByIdSelectTextMessages(_._id))
            .then(_ => new ChatMessagesIOModel(_))
            .then(_ => {
                result.add("messages", _);
            });
    }

    @method()
    public getMaterials(model: ChatGetMessagesMaterialIOModel): Q.Promise<any> {
        const result = this.result;

        return this.canView(model._id)
            .then(_ => {
                result.add("file", { path: path.join(config.material.chat.path, model._id), name: model.file })
            });
    }

    private canView(id: any): Q.Promise<ChatIOModel> {
        const session = this.getComponent(SessionManerger);
        const chatBusiness = this.getComponent(ChatBusiness);

        return chatBusiness.findById(id).then(_ => {
            if (_ == null)
                return Q.reject<ChatIOModel>(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

            if (!_.canView(session.session.user))
                return Q.reject<ChatIOModel>(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

            return _;
        });
    }

    private canUpdate(id: any): Q.Promise<ChatIOModel> {
        const session = this.getComponent(SessionManerger);
        const chatBusiness = this.getComponent(ChatBusiness);

        return chatBusiness.findById(id).then(_ => {
            if (_ == null)
                return Q.reject<ChatIOModel>(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

            if (!_.canUpdate(session.session.user))
                return Q.reject<ChatIOModel>(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

            return _;
        });
    }
}

export default ChatService;
