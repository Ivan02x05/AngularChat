import BaseDBModel from "./base.db.model";
import ChatMessageDocument from "../documents/chat.message.document";

export {ChatMessageDocument};

export class ChatMessageDBModel extends BaseDBModel<ChatMessageDocument> {
}

export default ChatMessageDBModel;
