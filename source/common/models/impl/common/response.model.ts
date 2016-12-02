import IResponseModel from "../../common/response.model.interface";
import BaseModel from "./base.model";
import ErrorModel from "./error.model";
import MessageModel from "./message.model";
import {ErrorConstant} from "../../../constants/error.constant";

export class ResponseModel implements IResponseModel {
    public models: any;
    public errors: ErrorModel[];

    constructor(obj?: any) {
        BaseModel.setValues(this, "models", null, obj);
        BaseModel.setValues(this, "errors", (_ => new ErrorModel(_.code, _.message, _.level)), obj);
    }

    public get level(): ErrorConstant.ErrorLevel {
        if (this.errors && this.errors.length > 0) {
            return this.errors.sort((a, b) => {
                return b.level - a.level;
            })[0].level;
        } else
            return -1;
    }

    public get hasInfo(): boolean {
        var level = this.level;
        return level != -1
            && level == ErrorConstant.ErrorLevel.Info;
    }

    public get hasWarning(): boolean {
        var level = this.level;
        return level != -1
            && level == ErrorConstant.ErrorLevel.Warning;
    }

    public get hasError(): boolean {
        var level = this.level;
        return level != -1
            && level >= ErrorConstant.ErrorLevel.Error;
    }
}

export default ResponseModel;
