import BaseSchema from "./base.schema";
import {MessageModel, MessageDocument} from "../models/message.model";
import {getValues} from "../../../common/utils/enum.util";
import {ErrorConstant} from "../../../common/constants/error.constant";
import {DataBaseConstant} from "../../common/constants/database.constant";

export {MessageModel, MessageDocument};

export class MessageSchema extends BaseSchema<MessageModel> {
    constructor() {
        const level = getValues(ErrorConstant.ErrorLevel);
        const schema: Object =
            {
                code: { type: String, required: true, index: { unique: true } },
                message: { type: String, required: true },
                level: { type: Number, required: true, enum: level }
            };

        super(schema);
    }

    public getCollectionName() {
        return DataBaseConstant.Collections.MESSAGE;
    }

    public getModelType() {
        return MessageModel;
    }
}

export default MessageSchema;
