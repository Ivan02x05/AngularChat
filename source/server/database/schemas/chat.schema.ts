/// <reference path="../../../../typings/tsd.d.ts"/>

import {Schema}  from "mongoose";

import BaseSchema from "./base.schema";
import {ChatModel, ChatDocument} from "../models/chat.model";
import UserInfoSchema from "./user.info.schema";
import DivisionSaveSchema from "./division.save.schema";
import {DataBaseConstant} from "../../common/constants/database.constant";

export {ChatModel, ChatDocument};

export class ChatSchema extends BaseSchema<ChatModel> {
    constructor() {
        const schema: Object =
            {
                code: { type: Number, required: true, index: { unique: true } },
                title: { type: String, required: true, maxlength: 20 },
                permission: { type: BaseSchema.getSchema(DivisionSaveSchema), required: true },
                users: {
                    type: [BaseSchema.getSchema(UserInfoSchema)]
                }
            };

        super(schema);
    }

    public getCollectionName() {
        return DataBaseConstant.Collections.CHAT;
    }

    public getModelType() {
        return ChatModel;
    }
}

export default ChatSchema;
