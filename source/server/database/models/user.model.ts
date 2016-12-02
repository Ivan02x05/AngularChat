import BaseModel from "./base.model";
import UserDocument from "../documents/user.document";

export {UserDocument};

export class UserModel extends BaseModel<UserDocument> {
}

export default UserModel;
