import IChatMessageModel from "../../../common/models/chat/chat.message.model.interface";
import BaseDocument from "./base.document";

interface ChatMessageDocument extends IChatMessageModel, BaseDocument {
}

export default ChatMessageDocument;
