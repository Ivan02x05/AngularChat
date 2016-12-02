/// <reference path="../../../typings/tsd.d.ts"/>

import * as Q from "q";
import * as path from "path";

import BaseService from "./common/base.service";
import {service, method} from "./common/service.decorator";
import UserModel from "../../common/models/impl/common/user.model";
import UserInfoModel from "../../common/models/impl/common/user.info.model";
import {ChatModel, ChatJoinModel} from "../../common/models/impl/chat/chat.model";
import ChatViewedNoModel from "../../common/models/impl/chat/chat.viewedno.model";
import {ChatMessagesModel, ChatMessageModel, ChatMessageDataModel, ChatAddMessageModel,
    ChatGetMessageListModel, ChatSearchMessagesModel, ChatGetMessagesMaterialModel}
from "../../common/models/impl/chat/chat.message.model";

import ChatBusiness from "../business/chat.business";
import ChatViewedNoBusiness from "../business/chat.viewedno.business";
import ChatMessageBusiness from "../business/chat.message.business";
import SessionManerger from "../common/manergers/session.manerger";
import {ErrorConstant} from "../../common/constants/error.constant";
import Exception from "../common/exceptions/exception";
import * as fileutil from "../common/utils/file.util";

var config = require("../common/resources/config/www/www.json");

@service
class ChatService extends BaseService {

    @method()
    public getChatList(): Q.Promise<any> {
        var result = this.result;
        var chatBusiness = this.getComponent(ChatBusiness);
        var viewedNoBusiness = this.getComponent(ChatViewedNoBusiness);
        var messageBusiness = this.getComponent(ChatMessageBusiness);
        var session = this.getComponent(SessionManerger);

        return Q.all<any>(
            [
                chatBusiness.getPermissionChats(session.session.user),
                viewedNoBusiness.findById(session.session.user._id)
            ]
        )
            .then(data => {
                return {
                    chats: <ChatModel[]>data[0],
                    viewed: <ChatViewedNoModel>data[1]
                };
            })
            .then(data => {
                var chats = data.chats;
                var viewed = data.viewed;
                result.add("chats", chats);
                result.add("viewed", viewed);

                if (chats.length == 0)
                    return;

                return Q.all<void>(chats.map(_ => {
                    return messageBusiness.findByIdSelectId(_._id)
                        .then(messages => {
                            var v = viewed.chats.filter(__ => _._id == __.chatId);
                            if (v.length == 0)
                                _.unread = messages.messages.length;
                            else {
                                v[0].code = _.code;
                                var count = 0;
                                if (!v[0].messageId)
                                    count = messages.messages.length;
                                else
                                    count = messages.indexOf(v[0].messageId);

                                if (count != 0)
                                    _.unread = count;
                            }
                        });
                }));
            });
    }

    @method()
    public join(model: { code: number, readed?: any }): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(ChatMessageBusiness);

        return this.canViewByCode(model.code)
            .then(_ => {
                result.add("chat", _);
                return _;
            })
            .then(chat => business.findByIdSelectId(chat._id)
                .then(messages => {
                    return {
                        chat: chat,
                        messages: messages
                    };
                }))
            .then(data => {
                // 未読は全て取得
                var count;
                if (!model.readed)
                    count = data.messages.messages.length;
                else
                    count = data.messages.indexOf(model.readed);

                if (count != 0)
                    data.chat.unread = count;

                return business.findByIdSelectMessages({ id: data.chat._id, count: count })
                    .then(select => {
                        return {
                            all: data.messages,
                            select: new ChatMessagesModel(select)
                        };
                    })
            })
            .then(data => {
                data.select.unshown = data.all.messages.length - data.select.messages.length;
                if (data.select.unshown <= 0)
                    data.select.unshown = null;
                return data.select;
            })
            .then(messages => {
                result.add("messages", messages);
            });
    }

    @method()
    public getMessageList(model: ChatGetMessageListModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(ChatMessageBusiness);

        return this.canViewById(model._id)
            .then(_ => business.findByIdSelectMessages({ id: model._id, skip: model.skip, date: model.date }))
            .then(_ => new ChatMessagesModel(_))
            .then(_ => {
                _.unshown = model.skip - _.messages.length;
                if (_.unshown <= 0)
                    _.unshown = null;
                return _;
            })
            .then(_ => {
                result.add("messages", _);
            });
    }

    @method()
    public getMessageDailyList(model: ChatJoinModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(ChatMessageBusiness);

        return this.canViewByCode(model.code)
            .then(_ => business.findByIdGroupByDate(_._id))
            .then(_ => _.map(__ => new ChatMessagesModel(
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
    public regist(model: ChatModel): Q.Promise<any> {
        var result = this.result;
        var chatBusiness = this.getComponent(ChatBusiness);
        var messageBusiness = this.getComponent(ChatMessageBusiness);

        return chatBusiness.regist(model)
            .then(_ => {
                _.unread = 0;
                result.add("chat", _);
                return messageBusiness.regist(_._id);
            });
    }

    @method()
    public update(model: ChatModel): Q.Promise<any> {
        var result = this.result;
        var chatBusiness = this.getComponent(ChatBusiness);
        var messageBusiness = this.getComponent(ChatMessageBusiness);

        return this.canUpdateById(model._id)
            .then(_ => {
                result.add("before", _);
                return _;
            })
            .then(() => chatBusiness.update(model))
            .then(_ => {
                result.add("after", _);
                return _;
            })
            .then(_ => messageBusiness.findByIdSelectId(_._id))
            .then(_ => {
                result.add("messages", _);
            });
    }

    @method()
    public delete(model: ChatModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(ChatBusiness);

        return this.canUpdateById(model._id)
            .then(_ => business.delete(_))
            .then(_ => {
                result.add("chat", _);
            });
    }

    @method()
    public close(model: ChatViewedNoModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(ChatViewedNoBusiness);

        return business.save(model)
            .then(_ => {
                result.add("viewed", _);
            });
    }

    @method()
    public addMessage(model: ChatAddMessageModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(ChatMessageBusiness);
        var session = this.getComponent(SessionManerger);

        return this.canViewById(model._id)
            .then(_ => {
                return business.addMessage(model._id,
                    new ChatMessageModel(
                        {
                            message: model.message,
                            user: new UserInfoModel(session.session.user)
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
                        path: path.join(config.material.chat.path, _.chat.code.toString()),
                        name: _.message.message.data
                    })
            });
    }

    @method()
    public search(model: ChatSearchMessagesModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(ChatMessageBusiness);

        return this.canViewById(model._id)
            .then(_ => business.findByIdMessageSearch({ id: model._id, condition: model.condition }))
            .then(_ => new ChatMessagesModel(_))
            .then(_ => {
                result.add("messages", _);
            });
    }

    @method()
    public download(model: ChatJoinModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(ChatMessageBusiness);

        return this.canViewByCode(model.code)
            .then(_ => business.findByIdSelectTextMessages(_._id))
            .then(_ => new ChatMessagesModel(_))
            .then(_ => {
                result.add("messages", _);
            });
    }

    @method()
    public getMaterials(model: ChatGetMessagesMaterialModel): Q.Promise<any> {
        var result = this.result;

        return this.canViewByCode(model.code)
            .then(_ => {
                result.add("file", { path: path.join(config.material.chat.path, model.code.toString()), name: model.file })
            });
    }

    private canView(fn: Q.Promise<ChatModel>): Q.Promise<ChatModel> {
        var session = this.getComponent(SessionManerger);
        return fn.then(_ => {
            if (_ == null)
                return Q.reject<ChatModel>(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

            if (!_.canView(session.session.user))
                return Q.reject<ChatModel>(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

            return _;
        });
    }

    private canViewById(id: any): Q.Promise<ChatModel> {
        var chatBusiness = this.getComponent(ChatBusiness);
        return this.canView(chatBusiness.findById(id));
    }

    private canViewByCode(code: number): Q.Promise<ChatModel> {
        var chatBusiness = this.getComponent(ChatBusiness);
        return this.canView(chatBusiness.findByCode(code));
    }

    private canUpdate(fn: Q.Promise<ChatModel>): Q.Promise<ChatModel> {
        var session = this.getComponent(SessionManerger);
        return fn.then(_ => {
            if (_ == null)
                return Q.reject<ChatModel>(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

            if (!_.canUpdate(session.session.user))
                return Q.reject<ChatModel>(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

            return _;
        });
    }

    private canUpdateById(id: any): Q.Promise<ChatModel> {
        var chatBusiness = this.getComponent(ChatBusiness);
        return this.canUpdate(chatBusiness.findById(id));
    }

    private canUpdateByCode(code: number): Q.Promise<ChatModel> {
        var chatBusiness = this.getComponent(ChatBusiness);
        return this.canUpdate(chatBusiness.findByCode(code));
    }
}

export default ChatService;
