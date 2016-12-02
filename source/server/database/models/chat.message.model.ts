import BaseModel from "./base.model";
import ChatMessageDocument from "../documents/chat.message.document";

export {ChatMessageDocument};

export class ChatMessageModel extends BaseModel<ChatMessageDocument> {
}

export default ChatMessageModel;
