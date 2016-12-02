import IUserModel from "./user.model.interface";
export interface ISessionModel {
    user: IUserModel;
}

export default ISessionModel;
