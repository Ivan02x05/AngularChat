import IBaseModel from "./base.model.interface";
import IErrorModel from "./error.model.interface";

export interface IResponseModel {
    models?: any;
    errors?: IErrorModel[];
}

export default IResponseModel;
