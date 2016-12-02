import {ErrorConstant} from "../../constants/error.constant";

export interface IErrorModel {
    code: string;
    message: string;
    level: ErrorConstant.ErrorLevel;
}

export default IErrorModel;
