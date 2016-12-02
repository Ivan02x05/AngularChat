/// <reference path="../../../../typings/tsd.d.ts"/>

import {Schema}  from "mongoose";

import BaseSchema from "./base.schema";
import {ChatViewedNoModel, ChatViewedNoDocument} from "../models/chat.viewedno.model";
import {DataBaseConstant} from "../../common/constants/database.constant";
import ChatSchema from "./chat.schema";
import UserSchema from "./user.schema";

export {ChatViewedNoModel, ChatViewedNoDocument};

export class ChatViewedNoSchema extends BaseSchema<ChatViewedNoModel> {
    constructor() {
        const schema: Object =
            {
                _id: {
                    type: Schema.Types.ObjectId, required: true, index: { unique: true },
                    ref: BaseSchema.getSchema(UserSchema).getCollectionName()
                },
                chats: {
                    type: [{
                        _id: false,
                        chatId: {
                            type: Schema.Types.ObjectId, required: true,
                            ref: BaseSchema.getSchema(ChatSchema).getCollectionName()
                        },
                        messageId: { type: Schema.Types.ObjectId }
                    }]
                }
            };

        super(schema, { nosystem: true, "_id": false });
    }

    public getCollectionName() {
        return DataBaseConstant.Collections.CHAT_VIED_NO;
    }

    public getModelType() {
        return ChatViewedNoModel;
    }
}

export default ChatViewedNoSchema;
