import IUserModel from "../../common/user.model.interface";
import BaseModel from "./base.model";
import {CodeConstant} from "../../../constants/code.constant";
import DivisionSaveModel from "./division.save.model";

export class UserModel extends BaseModel implements IUserModel {
    public userId: string;
    public password: string;
    public name: { first: string, last: string };
    public role: DivisionSaveModel;
    public mode: DivisionSaveModel;
    public active: boolean;

    constructor(obj?: any) {
        super(obj);

        this.setValues("userId", String, obj);
        this.setValues("password", String, obj);
        this.setValues("name", (_ => { return { first: _.first, last: _.last } }), obj);
        this.setValues("role", DivisionSaveModel, obj);
        this.setValues("mode", DivisionSaveModel, obj);
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

    public canView(user: UserModel): boolean {
        return user.isAdmin
            || this._id == user._id;
    }

    public get isSecret(): boolean {
        return this.mode.subcode == CodeConstant.Division.SubCode.DisplayMode.SECRET;
    }
}

export class UserGetModel extends BaseModel {
}

export default UserModel;
