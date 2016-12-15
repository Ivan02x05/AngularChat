import IUserModel from "../../if/common/user.model.interface";
import BaseIOModel from "./base.io.model";
import {CodeConstant} from "../../../constants/code.constant";
import DivisionSaveIOModel from "./division.save.io.model";

export class UserIOModel extends BaseIOModel implements IUserModel {
    public userId: string;
    public password: string;
    public name: { first: string, last: string };
    public role: DivisionSaveIOModel;
    public mode: DivisionSaveIOModel;
    public active: boolean;

    constructor(obj?: any) {
        super(obj);

        this.setValues("userId", String, obj);
        this.setValues("password", String, obj);
        this.setValues("name", (_ => { return { first: _.first, last: _.last } }), obj);
        this.setValues("role", DivisionSaveIOModel, obj);
        this.setValues("mode", DivisionSaveIOModel, obj);
        this.setValues("active", Boolean, obj, false);
    }

    public get fullname(): string {
        if (this.name)
            return this.name.last + " " + this.name.first;
        else
            return null;
    }

    public get isAdmin(): boolean {
        return this.role.subcode == CodeConstant.Division.SubCode.Role.ADMINISTRATOR;
    }

    public canView(user: UserIOModel): boolean {
        return user.isAdmin
            || this._id == user._id;
    }

    public get isSecret(): boolean {
        return this.mode.subcode == CodeConstant.Division.SubCode.DisplayMode.SECRET;
    }
}

export class UserGetIOModel extends BaseIOModel {
}

export default UserIOModel;
