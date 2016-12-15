import IChatViewedNoModel from "../../if/chat/chat.viewedno.model.interface";
import BaseIOModel from "../common/base.io.model";

export class ChatViewedNoIOModel extends BaseIOModel implements IChatViewedNoModel {
    public chats: { chatId: any, code: number, messageId?: any }[];

    constructor(obj?: any) {
        super(obj);

        this.setValues("chats", (_ => {
            return {
                chatId: BaseIOModel.convertValue(String, _.chatId),
                code: _.code,
                messageId: BaseIOModel.convertValue(String, _.messageId)
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

export default ChatViewedNoIOModel;
