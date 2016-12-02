import BaseSchema from "./base.schema";
import {BaseModel, BaseDocument} from "../models/base.model";

export class DivisionSaveSchema extends BaseSchema<BaseModel<BaseDocument>> {
    constructor() {
        const schema: Object =
            {
                subcode: { type: String, required: true, minlength: 2, maxlength: 2 },
                value: { type: String, required: true, maxlength: 20 }
            };

        super(schema, { nosystem: true, "_id": false });
    }

    public getCollectionName() {
        return null;
    }

    public getModelType() {
        return null;
    }
}

export default DivisionSaveSchema;
