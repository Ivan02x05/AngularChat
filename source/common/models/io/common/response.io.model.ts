import BaseIOModel from "./base.io.model";
import ErrorIOModel from "./error.io.model";
import MessageIOModel from "./message.io.model";
import {ErrorConstant} from "../../../constants/error.constant";

const NON_ERROR = -1;

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
            return NON_ERROR;
    }

    public get hasInfo(): boolean {
        return this.level == ErrorConstant.ErrorLevel.Info;
    }

    public get hasWarning(): boolean {
        return this.level == ErrorConstant.ErrorLevel.Warning;
    }

    public get hasError(): boolean {
        return this.level == ErrorConstant.ErrorLevel.Error;
    }

    public get hasFatal(): boolean {
        return this.level == ErrorConstant.ErrorLevel.Fatal;
    }
}

export default ResponseIOModel;
