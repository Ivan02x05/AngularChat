import IBaseModel from "../common/base.model.interface";

export interface IChatViewedNoModel extends IBaseModel {
    chats: { chatId: any, messageId?: any }[];
}

export default IChatViewedNoModel;
