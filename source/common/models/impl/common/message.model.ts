import IMessageModel from "../../common/message.model.interface";
import BaseModel from "./base.model";
import {ErrorConstant} from "../../../constants/error.constant";

export class MessageModel extends BaseModel implements IMessageModel {
    public code: string;
    public message: string;
    public level: ErrorConstant.ErrorLevel;

    constructor(obj?: any) {
        super(obj);

        this.setValues("code", String, obj);
        this.setValues("message", String, obj);
        this.setValues("level", Number, obj, -1);
    }
}

export default MessageModel;
