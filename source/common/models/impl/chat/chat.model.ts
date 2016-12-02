import IChatModel from "../../chat/chat.model.interface";
import BaseModel from "../common/base.model";
import UserModel from "../common/user.model";
import UserInfoModel from "../common/user.info.model";
import DivisionSaveModel from "../common/division.save.model";
import {CodeConstant} from "../../../constants/code.constant";

export class ChatModel extends BaseModel implements IChatModel {
    public code: number;
    public title: string;
    public permission: DivisionSaveModel;
    public users: UserInfoModel[];
    public unread: number;
    public active: boolean;

    constructor(obj?: any) {
        super(obj);

        this.setValues("code", Number, obj);
        this.setValues("title", String, obj);
        this.setValues("permission", DivisionSaveModel, obj);
        this.setValues("users", UserInfoModel, obj);
        this.setValues("unread", Number, obj);
        this.setValues("active", Boolean, obj);
    }

    public canView(user: UserModel): boolean {
        return user.isAdmin
            || this.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.ALL
            || this.users.filter(_ => _._id == user._id).length > 0;
    }

    public canUpdate(user: UserModel): boolean {
        return user.isAdmin
            || (this.systemColumn.createUser._id == user._id
                && this.canView(user));
    }
}

export class ChatJoinModel extends BaseModel {
    public code: number;

    constructor(obj?: any) {
        super(obj);

        this.setValues("code", Number, obj);
    }
}

export default ChatModel;
