import ErrorIOModel from "../models/io/common/error.io.model";
import MessageIOModel from "../models/io/common/message.io.model";
import {ErrorConstant} from "../constants/error.constant";

abstract class AbstractException extends Error {
    public errors: ErrorIOModel[];
    public exception: any;

    constructor(value: string | ErrorIOModel | ErrorIOModel[], params?: string[], exception?: any) {
        super();
        this.addError(value, params);
        this.exception = exception;
    }

    protected abstract getManerger(): { getMessage: (code: string, args?: string[]) => MessageIOModel };

    private createError(value: string, params?: string[]): ErrorIOModel {
        let error: ErrorIOModel;
        try {
            // MessageManerger作成で失敗した場合、エラーを発生させない
            const model: MessageIOModel = this.getManerger().getMessage(value, params);
            error = new ErrorIOModel(model.code, model.message, model.level);
        } catch (error) {
            error = new ErrorIOModel(ErrorConstant.Code.Fatal.UN_DEFINED,
                "未定義のエラーが発生しました。", ErrorConstant.ErrorLevel.Fatal);
        }

        return error;
    }

    public addError(value: string | ErrorIOModel | ErrorIOModel[], params?: string[]) {
        if (Array.isArray(value)) {
            this.errors = <ErrorIOModel[]>value;
        } else {
            if (this.errors == null)
                this.errors = [];

            if (value instanceof ErrorIOModel) {
                this.errors.push(<ErrorIOModel>value);
            } else {
                this.errors.push(this.createError(<string>value, params));
            }
        }
    }

    public get name(): string {
        return "exception";
    }

    public get message(): string {
        let message: string = "";
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

export default AbstractException;
