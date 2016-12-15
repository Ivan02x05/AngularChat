import BaseSchema from "./base.schema";
import {MessageDBModel, MessageDocument} from "../models/message.db.model";
import {getValues} from "../../../common/utils/enum.util";
import {ErrorConstant} from "../../../common/constants/error.constant";
import {DataBaseConstant} from "../../common/constants/database.constant";

export {MessageDBModel, MessageDocument};

export class MessageSchema extends BaseSchema<MessageDBModel> {
    constructor() {
        const level = getValues(ErrorConstant.ErrorLevel);
        const schema: Object =
            {
                code: { type: String, required: true, index: { unique: true } },
                message: { type: String, required: true },
                level: { type: Number, required: true, enum: level }
            };

        // 排他エラー時にメッセージを設定するため、nosystem:trueを設定する
        super(schema, { nosystem: true });
    }

    public getCollectionName() {
        return DataBaseConstant.Collections.MESSAGE;
    }

    public getModelType() {
        return MessageDBModel;
    }
}

export default MessageSchema;
