import {ErrorConstant} from "../../../constants/error.constant";

export class ErrorIOModel {
    public code: string;
    public message: string;
    public level: ErrorConstant.ErrorLevel;

    constructor(code: string, message: string, level?: ErrorConstant.ErrorLevel) {
        this.code = code;
        this.message = message;
        if (level)
            this.level = level;
        else
            this.level = ErrorConstant.getLevelFromCode(this.code);
    }
}

export default ErrorIOModel;
