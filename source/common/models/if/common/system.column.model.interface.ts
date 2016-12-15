import IUserInfoModel from "./user.info.model.interface";

export interface ISystemColumnModel {
    deleteFlag: boolean;
    version: number;
    createUser: IUserInfoModel;
    createDate: Date;
    updateUser: IUserInfoModel;
    updateDate: Date;
}

export default ISystemColumnModel;
