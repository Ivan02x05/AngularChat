import IUserInfoModel from "../../if/common/user.info.model.interface";
import BaseIOModel from "./base.io.model";

export class UserInfoIOModel implements IUserInfoModel {
    public _id: any;
    public name: { first: string, last: string };
    public logined: boolean;

    constructor(obj?: any) {
        BaseIOModel.setValues(this, "_id", String, obj);
        BaseIOModel.setValues(this, "name", (_ => { return { first: _.first, last: _.last } }), obj);
        BaseIOModel.setValues(this, "logined", Boolean, obj);
    }

    public get fullname(): string {
        if (this.name)
            return this.name.last + " " + this.name.first;
        else
            return null;
    }
}

export default UserInfoIOModel;
