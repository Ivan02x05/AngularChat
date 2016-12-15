import IBaseModel from "./base.model.interface";

export interface IDivisionModel extends IBaseModel {
    code: string;
    subcode: string;
    value: string;
}

export default IDivisionModel;
