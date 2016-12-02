import IBaseModel from "./base.model.interface";
import IDivisionSaveModel from "./division.save.model.interface";
import {CodeConstant} from "../../constants/code.constant";

export interface IDivisionModel extends IBaseModel, IDivisionSaveModel {
    code: string;
    subcode: string;
    value: string;
}

export default IDivisionModel;
