import BaseIOModel from "../../../../../common/models/io/common/base.io.model";
import {ChatIOModel} from "../../../../../common/models/io/chat/chat.io.model";
import {ChatMessageIOModel} from "../../../../../common/models/io/chat/chat.message.io.model";
import BaseScaleoutModel from "../common/base.scaleout.model";

export class ChatMessageAddScaleoutModel extends BaseScaleoutModel {
    public chat: ChatIOModel;
    public message: ChatMessageIOModel;

    constructor(obj?: any) {
        super(obj);

        BaseIOModel.setValues(this, "chat", ChatIOModel, obj);
        BaseIOModel.setValues(this, "message", ChatMessageIOModel, obj);
    }
}
