import * as Q from "q";

import BaseBusiness from "./common/base.business";
import ChatMessageSchema from "../database/schemas/chat.message.schema";
import {default as ChatMessagesIOModel, ChatMessageIOModel, ChatMessageDataIOModel}
from "../../common/models/io/chat/chat.message.io.model";

import SessionManerger from "../common/manergers/session.manerger";
import DivisionManerger from "../common/manergers/division.manerger";
import * as dateutil from "../../common/utils/date.util";
import {regexp} from "../../common/utils/string.util";
import {CodeConstant} from "../../common/constants/code.constant";

var config = require("../common/resources/config/database/database.json");

class ChatMessageBusiness extends BaseBusiness {

    public findById(id: any, fields?: Object): Q.Promise<ChatMessagesIOModel> {
        return this.database.model(ChatMessageSchema)
            .findById(id, fields)
            .then(result => new ChatMessagesIOModel(result))
            .then(result => {
                result.messages = result.messages.reverse();
                return result;
            });
    }

    public findByIdSelectId(id: any): Q.Promise<ChatMessagesIOModel> {
        return this.findById(id, "_id messages._id");
    }

    public findByIdSelectMessages(cond: { id: any, count?: number, skip?: number, date?: Date }):
        Q.Promise<{ _id: any, messages: ChatMessageIOModel[] }> {

        var messages = this.database.model(ChatMessageSchema);
        var pipeline: any =
            [
                {
                    $match:
                    {
                        _id: messages.toObjectId(cond.id)
                    }
                },
                {
                    $unwind:
                    {
                        path: "$messages",
                        includeArrayIndex: "index"
                    }
                }
            ];

        if (cond.date)
            pipeline.push(
                {
                    $match:
                    {
                        "messages.time":
                        {
                            $gte: cond.date,
                            $lt: dateutil.addDate(cond.date, 1)
                        }
                    }
                }
            );

        if (!cond.count || cond.count < config.select_count.chat_message)
            cond.count = config.select_count.chat_message;

        if (cond.skip) {
            var skip = cond.skip - cond.count;
            var count = cond.count;
            if (skip <= 0) {
                skip = 0;
                count = cond.skip;
            }
            pipeline.push(
                {
                    $skip: skip
                },
                {
                    $limit: count
                },
                {
                    $sort:
                    {
                        "index": -1
                    }
                }
            );
        }
        else
            pipeline.push(
                {
                    $sort:
                    {
                        "index": -1
                    }
                },
                {
                    $limit: cond.count
                }
            );

        pipeline.push(
            {
                $group:
                {
                    _id: "$_id",
                    messages: { $push: "$messages" }
                }
            }
        );

        return messages
            .aggregate(pipeline)
            .then((result: any) => result.length > 0 ? result[0] : { _id: cond.id, messages: [] })
            .then(result => {
                return {
                    _id: result._id,
                    messages: result.messages.map(_ => new ChatMessageIOModel(_))
                }
            });
    }

    public findByIdGroupByDate(id: any): Q.Promise<{ _id: any, date: Date, count: number }[]> {
        var messages = this.database.model(ChatMessageSchema);

        return messages
            .aggregate(
            [
                {
                    $match:
                    {
                        _id: messages.toObjectId(id)
                    }
                },
                {
                    $unwind: "$messages"
                },
                {
                    $project:
                    {
                        time:
                        {
                            $dateToString:
                            {
                                format: "%Y-%m-%d",
                                date: "$messages.time"
                            }
                        }
                    }
                },
                {
                    $group:
                    {
                        _id: "$time",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort:
                    {
                        "_id": -1
                    }
                }
            ]
            )
            .then((result: any) => {
                return result.map(_ => {
                    return {
                        _id: id,
                        date: dateutil.toYyyymmdd(_._id),
                        count: _.count
                    };
                });
            });
    }

    public findByIdMessageSearch(cond: { id: any, condition: string }): Q.Promise<{ _id: any, messages: ChatMessageIOModel[] }> {

        var messages = this.database.model(ChatMessageSchema);
        const condition = new RegExp(regexp.escape(cond.condition), "i");
        var pipeline: any =
            [
                {
                    $match:
                    {
                        _id: messages.toObjectId(cond.id)
                    }
                },
                {
                    $unwind:
                    {
                        path: "$messages",
                        includeArrayIndex: "index"
                    }
                },
                {
                    $match:
                    {
                        $or:
                        [
                            {
                                "messages.message.type.subcode": CodeConstant.Division.SubCode.MessageType.TEXT,
                                "messages.message.data": condition
                            },
                            {
                                "messages.message.type.subcode":
                                {
                                    $ne: CodeConstant.Division.SubCode.MessageType.TEXT
                                },
                                "messages.message.title": condition
                            }
                        ]
                    }
                },
                {
                    $sort:
                    {
                        "index": -1
                    }
                },
                {
                    $group:
                    {
                        _id: "$_id",
                        messages: { $push: "$messages" }
                    }
                }
            ];

        return messages
            .aggregate(pipeline)
            .then((result: any) => result.length > 0 ? result[0] : { _id: cond.id, messages: [] })
            .then(result => {
                return {
                    _id: result._id,
                    messages: result.messages.map(_ => new ChatMessageIOModel(_))
                }
            });
    }

    public findByIdSelectTextMessages(id: any): Q.Promise<{ _id: any, messages: ChatMessageIOModel[] }> {
        var messages = this.database.model(ChatMessageSchema);
        var pipeline: any =
            [
                {
                    $match:
                    {
                        _id: messages.toObjectId(id)
                    }
                },
                {
                    $unwind:
                    {
                        path: "$messages",
                        includeArrayIndex: "index"
                    }
                },
                {
                    $project:
                    {
                        "messages.message.type": 1,
                        "messages.message.title": 1,
                        "messages.message.data":
                        {
                            $cond:
                            [
                                {
                                    $eq:
                                    [
                                        "$messages.message.type.subcode",
                                        "01"
                                    ]
                                },
                                "$messages.message.data",
                                null
                            ]
                        },
                        "messages.user": 1,
                        "messages.time": 1,
                        "index": 1
                    }
                },
                {
                    $sort:
                    {
                        "index": -1
                    }
                },
                {
                    $group:
                    {
                        _id: "$_id",
                        messages: { $push: "$messages" }
                    }
                }
            ];

        return messages
            .aggregate(pipeline)
            .then((result: any) => result.length > 0 ? result[0] : { _id: id, messages: [] })
            .then(result => {
                return {
                    _id: result._id,
                    messages: result.messages.map(_ => new ChatMessageIOModel(_))
                }
            });
    }

    public regist(id: any): Q.Promise<ChatMessagesIOModel> {
        var messages = this.database.model(ChatMessageSchema);
        var message = messages.toDocument({
            _id: null,
            messages: []
        });
        // 生成時にIDがクリアされるため、ここで再設定する
        message._id = id;

        return messages.save(message)
            .then(result => new ChatMessagesIOModel(result));
    }

    public addMessage(id: any, message: ChatMessageIOModel):
        Q.Promise<ChatMessageIOModel> {

        var messages = this.database.model(ChatMessageSchema);
        var exec = (retry: number): Q.Promise<ChatMessageIOModel> => {
            // modelのメソッド等が含まれるとエラーになるため、db用のオブジェクトに変換
            var dbobject = message.dbobject;
            dbobject._id = messages.id;
            dbobject.time = messages.sysDate;
            dbobject.message.type.value = this.getComponent(DivisionManerger)
                .getValue(
                CodeConstant.Division.Code.MESSAGE_TYPE,
                dbobject.message.type.subcode);
            if (!message.message.isText)
                dbobject.message.data = dbobject._id + "." + dbobject.message.title.split(".")[1];

            return messages.findByIdAndUpdate({ _id: id }, { $push: { messages: dbobject } })
                .then(() => new ChatMessageIOModel(dbobject))
                .catch<ChatMessageIOModel>(_ => {
                    if (retry < config.retry.chat_message.count)
                        return Q.delay(config.retry.chat_message.second * 1000)
                            .then(() => exec(retry + 1));
                    else
                        return Q.reject(_);
                });
        };

        return exec(0);
    }
}

export default ChatMessageBusiness;
