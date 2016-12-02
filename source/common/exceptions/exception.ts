import ErrorModel from "../models/impl/common/error.model";
import MessageModel from "../models/impl/common/message.model";
import {ErrorConstant} from "../constants/error.constant";

abstract class AbstractException extends Error {
    public errors: ErrorModel[];
    public exception: any;

    constructor(value: string | ErrorModel | ErrorModel[], params?: string[], exception?: any) {
        super();
        this.addError(value, params);
        this.exception = exception;
    }

    protected abstract getManerger(): { getMessage: (code: string, args?: string[]) => MessageModel };

    private createError(value: string, params?: string[]): ErrorModel {
        var error: ErrorModel;
        try {
            // MessageManerger作成で失敗した場合、エラーを発生させない
            var model: MessageModel = this.getManerger().getMessage(value, params);
            error = new ErrorModel(model.code, model.message, model.level);
        } catch (error) {
            error = new ErrorModel(ErrorConstant.Code.Fatal.UN_DEFINED,
                "未定義のエラーが発生しました。", ErrorConstant.ErrorLevel.Fatal);
        }

        return error;
    }

    public addError(value: string | ErrorModel | ErrorModel[], params?: string[]) {
        if (Array.isArray(value)) {
            this.errors = <ErrorModel[]>value;
        } else {
            if (this.errors == null)
                this.errors = [];

            if (value instanceof ErrorModel) {
                this.errors.push(<ErrorModel>value);
            } else {
                this.errors.push(this.createError(<string>value, params));
            }
        }
    }

    public get name(): string {
        return "exception";
    }

    public get message(): string {
        var message: string = "";
        this.errors.forEach(_ => {
            message += _.message + "\r\n";
        });

        message = message.substring(0, message.length - "\r\n".length);

        if (this.exception != null)
            message += "\r\n" + this.exception;

        return message;
    }

    public get level(): ErrorConstant.ErrorLevel {
        return this.errors.sort((a, b) => {
            return b.level - a.level;
        })[0].level;
    }
}

export default AbstractException;
