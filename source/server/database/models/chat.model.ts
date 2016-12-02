import BaseModel from "./base.model";
import ChatDocument from "../documents/chat.document";

export {ChatDocument};

export class ChatModel extends BaseModel<ChatDocument> {
}

export default ChatModel;
