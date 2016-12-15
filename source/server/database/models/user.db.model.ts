import BaseDBModel from "./base.db.model";
import UserDocument from "../documents/user.document";

export {UserDocument};

export class UserDBModel extends BaseDBModel<UserDocument> {
}

export default UserDBModel;
