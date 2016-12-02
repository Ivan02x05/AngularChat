import IBaseModel from "../common/base.model.interface";
import IUserInfoModel from "../common/user.info.model.interface";
import IDivisionSaveModel from "../common/division.save.model.interface";

export interface IChatModel extends IBaseModel {
    code: number;
    title: string;
    permission: IDivisionSaveModel;
    users?: IUserInfoModel[];
}

export default IChatModel;
