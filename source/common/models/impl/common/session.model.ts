import ISessionModel from "../../common/session.model.interface";
import BaseModel from "./base.model";
import UserModel from "./user.model";

export class SessionModel implements ISessionModel {
    public user: UserModel;

    constructor(obj?: any) {
        BaseModel.setValues(this, "user", UserModel, obj);
    }
}

export default SessionModel;
