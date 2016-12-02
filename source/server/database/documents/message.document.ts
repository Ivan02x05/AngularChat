import IMessageModel from "../../../common/models/common/message.model.interface";
import BaseDocument from "./base.document";

interface MessageDocument extends IMessageModel, BaseDocument {
}

export default MessageDocument;
