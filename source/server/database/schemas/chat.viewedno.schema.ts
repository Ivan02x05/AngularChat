import {Schema}  from "mongoose";

import BaseSchema from "./base.schema";
import {ChatViewedNoDBModel, ChatViewedNoDocument} from "../models/chat.viewedno.db.model";
import {DataBaseConstant} from "../../common/constants/database.constant";
import ChatSchema from "./chat.schema";
import UserSchema from "./user.schema";

export {ChatViewedNoDBModel, ChatViewedNoDocument};

export class ChatViewedNoSchema extends BaseSchema<ChatViewedNoDBModel> {
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
        return ChatViewedNoDBModel;
    }
}

export default ChatViewedNoSchema;
