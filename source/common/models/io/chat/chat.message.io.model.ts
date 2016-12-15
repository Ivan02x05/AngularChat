import {IChatMessagesModel, IChatMessageModel, IChatMessageDataModel} from "../../if/chat/chat.message.model.interface";
import BaseIOModel from "../common/base.io.model";
import UserInfoIOModel from "../common/user.info.io.model";
import DivisionSaveIOModel from "../common/division.save.io.model";
import {CodeConstant} from "../../../constants/code.constant";

export class ChatMessageDataIOModel extends BaseIOModel implements IChatMessageDataModel {
    public data: string;
    public type: DivisionSaveIOModel;
    public title: string;

    constructor(obj?: any) {
        super(obj);

        this.setValues("data", String, obj);
        this.setValues("type", DivisionSaveIOModel, obj);
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

export class ChatMessageIOModel extends BaseIOModel implements IChatMessageModel {
    public message: ChatMessageDataIOModel;
    public user: UserInfoIOModel;
    public time: Date;
    public dispforce: boolean;

    constructor(obj?: any) {
        super(obj);

        this.setValues("message", ChatMessageDataIOModel, obj);
        this.setValues("user", UserInfoIOModel, obj);
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

export class ChatMessagesIOModel extends BaseIOModel implements IChatMessagesModel {
    public messages: ChatMessageIOModel[];
    public unshown: number;
    public date: Date;

    constructor(obj?: any) {
        super(obj);

        this.setValues("messages", ChatMessageIOModel, obj, []);
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

export class ChatAddMessageIOModel extends BaseIOModel {
    public message: ChatMessageDataIOModel;

    constructor(obj?: any) {
        super(obj);

        this.setValues("message", ChatMessageDataIOModel, obj);
    }
}

export class ChatGetMessageListIOModel extends BaseIOModel {
    public skip: number;
    public date: Date;

    constructor(obj?: any) {
        super(obj);

        this.setValues("skip", Number, obj);
        this.setValues("date", Date, obj);
    }
}

export class ChatSearchMessagesIOModel extends BaseIOModel {
    public condition: string;

    constructor(obj?: any) {
        super(obj);

        this.setValues("condition", String, obj);
    }
}

export class ChatGetMessagesMaterialIOModel extends BaseIOModel {
    public code: number;
    public file: string;

    constructor(obj?: any) {
        super(obj);

        this.setValues("code", Number, obj);
        this.setValues("file", String, obj);
    }
}

export default ChatMessagesIOModel;
