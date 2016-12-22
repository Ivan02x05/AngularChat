import * as Q from "q";

import BaseBusiness from "./common/base.business";
import ChatMessageSchema from "../database/schemas/chat.message.schema";
import {default as ChatMessagesIOModel, ChatMessageIOModel, ChatMessageDataIOModel}
from "../../common/models/io/chat/chat.message.io.model";

import DivisionManerger from "../common/manergers/division.manerger";
import * as dateutil from "../../common/utils/date.util";
import {regexp} from "../../common/utils/string.util";
import {CodeConstant} from "../../common/constants/code.constant";

const config = require("../common/resources/config/database/database.json");

class ChatMessageBusiness extends BaseBusiness {

    public findByIdMaxSeq(id: any): Q.Promise<{ seq: number, count: number }> {
        return this.database.model(ChatMessageSchema)
            .find({ original: id }, { seq: 1, "messages._id": 1 }, { sort: { seq: -1 }, limit: 1 })
            .then(result => result.length > 0 ? result[0] : { seq: 0, messages: [] })
            .then(result => {
                return {
                    seq: result.seq,
                    count: result.messages.length
                };
            });
    }

    public findByIdMessageIndex(cond: { chatId: any, messageId?: any }): Q.Promise<{ total: number, index: number }> {
        const messages = this.database.model(ChatMessageSchema);
        const pipeline: any = [
            {
                $match:
                {
                    original: messages.toObjectId(cond.chatId)
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
                    seq: 1,
                    index: 1,
                    "messages._id": 1
                }
            },
            {
                $sort:
                {
                    seq: 1,
                    index: 1
                }
            },
            {
                $group:
                {
                    _id: null,
                    "messages": { $push: "$messages" }
                }
            }
        ];
        let project: any =
            {
                $project:
                {
                    total: { $size: "$messages" }
                }
            };

        pipeline.push(project);

        if (cond.messageId != null) {
            project["$project"]["messages._id"] = 1;

            pipeline.push(
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
                        "messages._id": messages.toObjectId(cond.messageId)
                    }
                },
                {
                    $group:
                    {
                        _id: null,
                        index: { $first: "$index" },
                        total: { $first: "$total" }
                    }
                }
            );
        }

        return messages
            .aggregate(pipeline)
            .then((result: any) => result.length > 0 ? result[0] : { index: null, total: null })
            .then(result => {
                return {
                    index: result.index,
                    total: result.total
                };
            });
    }

    public findByIdSelectMessages(cond: { id: any, count?: number, skip?: number, date?: Date }):
        Q.Promise<{ _id: any, messages: ChatMessageIOModel[] }> {

        const messages = this.database.model(ChatMessageSchema);
        const pipeline: any =
            [
                {
                    $match:
                    {
                        original: messages.toObjectId(cond.id)
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
            let skip = cond.skip - cond.count;
            let count = cond.count;
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
                        "seq": -1,
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
                        "seq": -1,
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
                    _id: "$original",
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
                    messages: result.messages.map(_ => new ChatMessageIOModel(_)),
                    date: cond.date
                }
            });
    }

    public findByIdGroupByDate(id: any): Q.Promise<{ _id: any, date: Date, count: number }[]> {
        const messages = this.database.model(ChatMessageSchema);

        return messages
            .aggregate(
            [
                {
                    $match:
                    {
                        original: messages.toObjectId(id)
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

    public findByIdMessageSearch(cond: { id: any, condition: string }):
        Q.Promise<{ _id: any, messages: ChatMessageIOModel[] }> {

        const messages = this.database.model(ChatMessageSchema);
        const condition = new RegExp(regexp.escape(cond.condition), "i");
        const pipeline: any =
            [
                {
                    $match:
                    {
                        original: messages.toObjectId(cond.id)
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
                        "seq": -1,
                        "index": -1
                    }
                },
                {
                    $group:
                    {
                        _id: "$original",
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
        const messages = this.database.model(ChatMessageSchema);
        const pipeline: any =
            [
                {
                    $match:
                    {
                        original: messages.toObjectId(id)
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
                        "seq": -1,
                        "index": -1
                    }
                },
                {
                    $group:
                    {
                        _id: "$original",
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

    public regist(id: any, seq?: number): Q.Promise<ChatMessagesIOModel> {
        const messages = this.database.model(ChatMessageSchema);

        return Q.fcall(() => { })
            .then(() => {
                if (seq == null)
                    return this.findByIdMaxSeq(id)
                        .then(model => model.seq + 1);
                else
                    return seq;
            })
            .then(seq => messages
                .toDocument(
                new ChatMessagesIOModel({
                    original: id,
                    seq: seq,
                    messages: []
                }))
            )
            .then(message => messages.save(message))
            .then(result => new ChatMessagesIOModel(result));
    }

    public addMessage(id: any, message: ChatMessageIOModel):
        Q.Promise<ChatMessageIOModel> {

        const messages = this.database.model(ChatMessageSchema);

        // modelのメソッド等が含まれるとエラーになるため、db用のオブジェクトに変換
        const dbobject = message.dbobject;
        dbobject._id = messages.id;
        dbobject.time = messages.sysDate;
        dbobject.message.type.value = this.getComponent(DivisionManerger)
            .getValue(
            CodeConstant.Division.Code.MESSAGE_TYPE,
            dbobject.message.type.subcode);
        if (!message.message.isText)
            dbobject.message.data = dbobject._id + "." + dbobject.message.title.split(".")[1];

        const exec = (retry: number): Q.Promise<ChatMessageIOModel> => {
            return this.findByIdMaxSeq(id)
                .then(seq => {
                    if (seq.count >= config.max_count.chat_message)
                        return this.regist(id, seq.seq + 1)
                            .then(result => result.seq);
                    else
                        return seq.seq;
                })
                .then(seq => messages.findOneAndUpdate({ original: id, seq: seq }, { $push: { messages: dbobject } }))
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
