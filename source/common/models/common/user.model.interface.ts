import IBaseModel from "./base.model.interface";
import IDivisionSaveModel from ".//division.save.model.interface";

export interface IUserModel extends IBaseModel {
    userId: string;
    password: string;
    name: { first: string, last: string };
    role: IDivisionSaveModel;
    mode: IDivisionSaveModel;
}

export default IUserModel;
