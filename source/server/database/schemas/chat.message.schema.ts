import {Schema, Types}  from "mongoose";

import BaseSchema from "./base.schema";
import ChatSchema from "./chat.schema";
import DivisionSaveSchema from "./division.save.schema";
import UserInfoSchema from "./user.info.schema";
import {ChatMessageDBModel, ChatMessageDocument} from "../models/chat.message.db.model";
import {DataBaseConstant} from "../../common/constants/database.constant";

export {ChatMessageDBModel, ChatMessageDocument};

export class ChatMessageSchema extends BaseSchema<ChatMessageDBModel> {
    constructor() {
        const schema: Object =
            {
                original: {
                    type: Schema.Types.ObjectId, required: true,
                    ref: BaseSchema.getSchema(ChatSchema).getCollectionName()
                },
                seq: {
                    type: Number, required: true
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

        super(schema, { nosystem: true });

        this.index({ original: 1, seq: 1 }, { unique: true });
    }

    public getCollectionName() {
        return DataBaseConstant.Collections.CHAT_MESSAGE;
    }

    public getModelType() {
        return ChatMessageDBModel;
    }
}

export default ChatMessageSchema;
