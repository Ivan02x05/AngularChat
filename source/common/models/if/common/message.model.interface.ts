import IBaseModel from "./base.model.interface";
import {ErrorConstant} from "../../../constants/error.constant";

export interface IMessageModel extends IBaseModel {
    code: string;
    message: string;
    level: ErrorConstant.ErrorLevel;
}

export default IMessageModel;
