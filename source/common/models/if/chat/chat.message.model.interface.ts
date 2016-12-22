import IBaseModel from "../common/base.model.interface";
import IUserInfoModel from "../common/user.info.model.interface";
import IDivisionSaveModel from "../common/division.save.model.interface";

export interface IChatMessageDataModel {
    data: string;
    type: IDivisionSaveModel;
    title?: string;
}

export interface IChatMessageModel {
    _id: any;
    message: IChatMessageDataModel;
    user: IUserInfoModel;
    time: Date;
}

export interface IChatMessagesModel extends IBaseModel {
    original: any;
    seq: number;
    messages: IChatMessageModel[];
}

export default IChatMessagesModel;
