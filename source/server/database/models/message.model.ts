import BaseModel from "./base.model";
import MessageDocument from "../documents/message.document";

export {MessageDocument};

export class MessageModel extends BaseModel<MessageDocument> {
}

export default MessageModel;
