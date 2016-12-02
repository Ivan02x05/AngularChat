import BaseSchema from "./base.schema";
import {SequenceModel, SequenceDocument} from "../models/sequence.model";
import {DataBaseConstant} from "../../common/constants/database.constant";

export {SequenceModel, SequenceDocument};

export class SequenceSchema extends BaseSchema<SequenceModel> {
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
        return SequenceModel;
    }
}

export default SequenceSchema;
