import IUserModel from "../../../common/models/if/common/user.model.interface";
import BaseDocument from "./base.document";

interface UserDocument extends IUserModel, BaseDocument {
}

export default UserDocument;
