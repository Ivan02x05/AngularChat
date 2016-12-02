import BaseModel from "./base.model";
import IUserInfoModel from "../../common/user.info.model.interface";
import IUserModel from "../../common/user.model.interface";

export class UserInfoModel implements IUserInfoModel {
    public _id: any;
    public name: { first: string, last: string };
    public logined: boolean;

    constructor(obj?: any) {
        BaseModel.setValues(this, "_id", String, obj);
        BaseModel.setValues(this, "name", (_ => { return { first: _.first, last: _.last } }), obj);
        BaseModel.setValues(this, "logined", Boolean, obj);
    }

    public get fullname(): string {
        if (this.name)
            return this.name.last + " " + this.name.first;
        else
            return null;
    }
}

export default UserInfoModel;
