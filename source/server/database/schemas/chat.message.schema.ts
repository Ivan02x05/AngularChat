/// <reference path="../../../../typings/tsd.d.ts"/>

import {Schema, Types}  from "mongoose";

import BaseSchema from "./base.schema";
import ChatSchema from "./chat.schema";
import DivisionSaveSchema from "./division.save.schema";
import UserInfoSchema from "./user.info.schema";
import {ChatMessageModel, ChatMessageDocument} from "../models/chat.message.model";
import {DataBaseConstant} from "../../common/constants/database.constant";

export {ChatMessageModel, ChatMessageDocument};

export class ChatMessageSchema extends BaseSchema<ChatMessageModel> {
    constructor() {
        const schema: Object =
            {
                _id: {
                    type: Schema.Types.ObjectId, required: true, index: { unique: true },
                    ref: BaseSchema.getSchema(ChatSchema).getCollectionName()
                },
                messages: {
                    type: [{
                        _id: { type: Schema.Types.ObjectId, required: true },
                        message: {
                            data: { type: String, required: true },
                            type: { type: BaseSchema.getSchema(DivisionSaveSchema), required: true },
                            title: { type: String }
                        },
                        user: { type: BaseSchema.getSchema(UserInfoSchema), required: true },
                        time: { type: Date, required: true }
                    }]
                }
            };

        super(schema, { nosystem: true, "_id": false });
    }

    public getCollectionName() {
        return DataBaseConstant.Collections.CHAT_MESSAGE;
    }

    public getModelType() {
        return ChatMessageModel;
    }
}

export default ChatMessageSchema;
