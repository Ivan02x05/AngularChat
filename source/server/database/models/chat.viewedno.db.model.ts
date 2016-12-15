import BaseDBModel from "./base.db.model";
import ChatViewedNoDocument from "../documents/chat.viewedno.document";

export {ChatViewedNoDocument};

export class ChatViewedNoDBModel extends BaseDBModel<ChatViewedNoDocument> {
}

export default ChatViewedNoDBModel;
