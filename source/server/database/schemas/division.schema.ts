import BaseSchema from "./base.schema";
import {DivisionDBModel, DivisionDocument} from "../models/division.db.model";
import {DataBaseConstant} from "../../common/constants/database.constant";

export {DivisionDBModel, DivisionDocument};

export class DivisionSchema extends BaseSchema<DivisionDBModel> {
    constructor() {
        const schema: Object =
            {
                code: { type: String, required: true, maxlength: 3, minlength: 3 },
                subcode: { type: String, required: true, minlength: 2, maxlength: 2 },
                value: { type: String, required: true, maxlength: 20 }
            };

        super(schema);

        this.index({ code: 1, subcode: 1 }, { unique: true });
    }

    public getCollectionName() {
        return DataBaseConstant.Collections.DIVISION;
    }

    public getModelType() {
        return DivisionDBModel;
    }
}

export default DivisionSchema;
