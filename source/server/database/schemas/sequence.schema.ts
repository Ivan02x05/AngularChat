import BaseSchema from "./base.schema";
import {SequenceDBModel, SequenceDocument} from "../models/sequence.db.model";
import {DataBaseConstant} from "../../common/constants/database.constant";

export {SequenceDBModel, SequenceDocument};

export class SequenceSchema extends BaseSchema<SequenceDBModel> {
    constructor() {
        const schema: Object =
            {
                name: { type: String, required: true },
                seq: { type: Number, required: true }
            };

        super(schema);
    }

    public getCollectionName(): string {
        return DataBaseConstant.Collections.SEQUENCE;
    }

    public getModelType() {
        return SequenceDBModel;
    }
}

export default SequenceSchema;
