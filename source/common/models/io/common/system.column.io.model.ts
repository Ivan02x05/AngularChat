import ISystemColumnModel from "../../if/common/system.column.model.interface";
import BaseIOModel from "./base.io.model"
import UserInfoIOModel from "./user.info.io.model"

export class SystemColumnIOModel implements ISystemColumnModel {
    public deleteFlag: boolean;
    public version: number;
    public createUser: UserInfoIOModel;
    public createDate: Date;
    public updateUser: UserInfoIOModel;
    public updateDate: Date;

    constructor(obj?: any) {
        BaseIOModel.setValues(this, "deleteFlag", Boolean, obj);
        BaseIOModel.setValues(this, "version", Number, obj);
        BaseIOModel.setValues(this, "createUser", UserInfoIOModel, obj);
        BaseIOModel.setValues(this, "createDate", Date, obj);
        BaseIOModel.setValues(this, "updateUser", UserInfoIOModel, obj);
        BaseIOModel.setValues(this, "updateDate", Date, obj);
    }
}

export default SystemColumnIOModel;
