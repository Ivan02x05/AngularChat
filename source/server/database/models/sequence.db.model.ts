import BaseDBModel from "./base.db.model";
import SequenceDocument from "../documents/sequence.document";

export {SequenceDocument};

export class SequenceDBModel extends BaseDBModel<SequenceDocument> {
}

export default SequenceDBModel;
