import ISystemColumnModel from "../../common/system.column.model.interface";
import BaseModel from "./base.model"
import UserInfoModel from "./user.info.model"

export class SystemColumnModel implements ISystemColumnModel {
    public deleteFlag: boolean;
    public version: number;
    public createUser: UserInfoModel;
    public createDate: Date;
    public updateUser: UserInfoModel;
    public updateDate: Date;

    constructor(obj?: any) {
        BaseModel.setValues(this, "deleteFlag", Boolean, obj);
        BaseModel.setValues(this, "version", Number, obj);
        BaseModel.setValues(this, "createUser", UserInfoModel, obj);
        BaseModel.setValues(this, "createDate", Date, obj);
        BaseModel.setValues(this, "updateUser", UserInfoModel, obj);
        BaseModel.setValues(this, "updateDate", Date, obj);
    }
}

export default SystemColumnModel;
