import BaseIOModel from "../../../../../common/models/io/common/base.io.model";
import {ChatIOModel} from "../../../../../common/models/io/chat/chat.io.model";
import BaseScaleoutModel from "../common/base.scaleout.model";

export class ChatRegistScaleoutModel extends BaseScaleoutModel {
    public chat: ChatIOModel;

    constructor(obj?: any) {
        super(obj);

        BaseIOModel.setValues(this, "chat", ChatIOModel, obj);
    }
}

export class ChatUpdateScaleoutModel extends BaseScaleoutModel {
    public before: ChatIOModel;
    public after: ChatIOModel;
    public mIds: string[];

    constructor(obj?: any) {
        super(obj);

        BaseIOModel.setValues(this, "before", ChatIOModel, obj);
        BaseIOModel.setValues(this, "after", ChatIOModel, obj);
        BaseIOModel.setValues(this, "mIds", String, obj, []);
    }
}

export class ChatDeleteScaleoutModel extends BaseScaleoutModel {
    public chat: ChatIOModel;

    constructor(obj?: any) {
        super(obj);

        BaseIOModel.setValues(this, "chat", ChatIOModel, obj);
    }
}
