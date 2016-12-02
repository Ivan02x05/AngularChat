import IChatModel from "../../../common/models/chat/chat.model.interface";
import BaseDocument from "./base.document";

interface ChatDocument extends IChatModel, BaseDocument {
}

export default ChatDocument;
