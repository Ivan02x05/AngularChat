import IChatModel from "../../if/chat/chat.model.interface";
import BaseIOModel from "../common/base.io.model";
import UserIOModel from "../common/user.io.model";
import UserInfoIOModel from "../common/user.info.io.model";
import DivisionSaveIOModel from "../common/division.save.io.model";
import {CodeConstant} from "../../../constants/code.constant";

export class ChatIOModel extends BaseIOModel implements IChatModel {
    public title: string;
    public permission: DivisionSaveIOModel;
    public users: UserInfoIOModel[];
    public unread: number;
    public active: boolean;

    constructor(obj?: any) {
        super(obj);

        this.setValues("title", String, obj);
        this.setValues("permission", DivisionSaveIOModel, obj);
        this.setValues("users", UserInfoIOModel, obj);
        this.setValues("unread", Number, obj);
        this.setValues("active", Boolean, obj);
    }

    public canView(user: UserIOModel): boolean {
        return user.isAdmin
            || this.permission.subcode == CodeConstant.Division.SubCode.AccessPermission.ALL
            || this.users.filter(_ => _._id == user._id).length > 0;
    }

    public canUpdate(user: UserIOModel): boolean {
        return user.isAdmin
            || (this.systemColumn.createUser._id == user._id
                && this.canView(user));
    }
}

export default ChatIOModel;
