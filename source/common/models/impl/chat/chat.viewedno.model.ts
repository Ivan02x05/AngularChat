import IChatViewedNoModel from "../../chat/chat.viewedno.model.interface";
import BaseModel from "../common/base.model";

export class ChatViewedNoModel extends BaseModel implements IChatViewedNoModel {
    public chats: { chatId: any, code: number, messageId?: any }[];

    constructor(obj?: any) {
        super(obj);

        this.setValues("chats", (_ => {
            return {
                chatId: BaseModel.convertValue(String, _.chatId),
                code: _.code,
                messageId: BaseModel.convertValue(String, _.messageId)
            };
        }
        ), obj, []);
    }

    public countUnViewed(chatId: any, messageIds: any[]): number {
        var count: number = 0;
        var viewed = this.chats.filter(_ => _.chatId == chatId);
        if (viewed.length == 0 || viewed[0].messageId == null)
            count = messageIds.length;
        else {
            for (var id of messageIds) {
                if (id == viewed[0].messageId)
                    break;
                count++;
            }
            if (count == 0)
                count = null;
        }
        return count;
    }
}

export default ChatViewedNoModel;
