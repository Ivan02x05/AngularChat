import {Schema}  from "mongoose";

import BaseSchema from "./base.schema";
import UserSchema from "./user.schema";
import {BaseDBModel, BaseDocument} from "../models/base.db.model";

export class UserInfoSchema extends BaseSchema<BaseDBModel<BaseDocument>> {
    constructor() {
        const userSchema = BaseSchema.getSchema(UserSchema);
        const schema: Object =
            {
                _id: {
                    type: Schema.Types.ObjectId, required: true,
                    ref: userSchema.getCollectionName()
                },
                name: {
                    first: { type: String, required: true, maxlength: 20 },
                    last: { type: String, required: true, maxlength: 20 }
                }
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

export default UserInfoSchema;
