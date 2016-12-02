import {default as IChatMessagesModel, IChatMessageModel, IChatMessageDataModel} from "../../chat/chat.message.model.interface";
import BaseModel from "../common/base.model";
import UserInfoModel from "../common/user.info.model";
import DivisionSaveModel from "../common/division.save.model";
import {CodeConstant} from "../../../constants/code.constant";

export class ChatMessageDataModel extends BaseModel implements IChatMessageDataModel {
    public data: string;
    public type: DivisionSaveModel;
    public title: string;

    constructor(obj?: any) {
        super(obj);

        this.setValues("data", String, obj);
        this.setValues("type", DivisionSaveModel, obj);
        this.setValues("title", String, obj);
    }

    public get isText(): boolean {
        return this.type.subcode == CodeConstant.Division.SubCode.MessageType.TEXT;
    }

    public get isImage(): boolean {
        return this.type.subcode == CodeConstant.Division.SubCode.MessageType.IMAGE;
    }

    public get isVideo(): boolean {
        return this.type.subcode == CodeConstant.Division.SubCode.MessageType.VIDEO;
    }

    public get isFile(): boolean {
        return this.type.subcode == CodeConstant.Division.SubCode.MessageType.FILE;
    }

    public get isUnread(): boolean {
        return this.type.subcode == CodeConstant.Division.SubCode.MessageType.UNREAD;
    }
}

export class ChatMessageModel extends BaseModel implements IChatMessageModel {
    public message: ChatMessageDataModel;
    public user: UserInfoModel;
    public time: Date;
    public dispforce: boolean;

    constructor(obj?: any) {
        super(obj);

        this.setValues("message", ChatMessageDataModel, obj);
        this.setValues("user", UserInfoModel, obj);
        this.setValues("time", Date, obj);
        this.setValues("dispforce", Boolean, obj, false);
    }

    public get message4notification(): string {
        var msg: string;
        if (this.message.isText)
            msg = this.message.data;
        else
            msg = "(ファイル)";
        return msg + "\r\n(" + this.user.fullname + ")";
    }
}

export class ChatMessagesModel extends BaseModel implements IChatMessagesModel {
    public messages: ChatMessageModel[];
    public unshown: number;
    public date: Date;

    constructor(obj?: any) {
        super(obj);

        this.setValues("messages", ChatMessageModel, obj, []);
        this.setValues("unshown", Number, obj);
        this.setValues("date", Date, obj);
    }

    public indexOf(id: any): number {
        if (!id)
            return null;

        var index = 0;
        for (var msg of this.messages) {
            if (msg._id == id)
                break;
            index++;
        }

        return index;
    }
}

export class ChatAddMessageModel extends BaseModel {
    public message: ChatMessageDataModel;

    constructor(obj?: any) {
        super(obj);

        this.setValues("message", ChatMessageDataModel, obj);
    }
}

export class ChatGetMessageListModel extends BaseModel {
    public skip: number;
    public date: Date;

    constructor(obj?: any) {
        super(obj);

        this.setValues("skip", Number, obj);
        this.setValues("date", Date, obj);
    }
}

export class ChatSearchMessagesModel extends BaseModel {
    public condition: string;

    constructor(obj?: any) {
        super(obj);

        this.setValues("condition", String, obj);
    }
}

export class ChatGetMessagesMaterialModel extends BaseModel {
    public code: number;
    public file: string;

    constructor(obj?: any) {
        super(obj);

        this.setValues("code", Number, obj);
        this.setValues("file", String, obj);
    }
}

export default ChatMessagesModel;
