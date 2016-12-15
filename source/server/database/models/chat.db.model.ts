import BaseDBModel from "./base.db.model";
import ChatDocument from "../documents/chat.document";

export {ChatDocument};

export class ChatDBModel extends BaseDBModel<ChatDocument> {
}

export default ChatDBModel;
