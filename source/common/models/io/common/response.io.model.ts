import BaseIOModel from "./base.io.model";
import ErrorIOModel from "./error.io.model";
import MessageIOModel from "./message.io.model";
import {ErrorConstant} from "../../../constants/error.constant";

export class ResponseIOModel {
    public models: any;
    public errors: ErrorIOModel[];

    constructor(obj?: any) {
        BaseIOModel.setValues(this, "models", null, obj);
        BaseIOModel.setValues(this, "errors", (_ => new ErrorIOModel(_.code, _.message, _.level)), obj);
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

export default ResponseIOModel;
