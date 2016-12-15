import BaseDBModel from "./base.db.model";
import MessageDocument from "../documents/message.document";

export {MessageDocument};

export class MessageDBModel extends BaseDBModel<MessageDocument> {
}

export default MessageDBModel;
