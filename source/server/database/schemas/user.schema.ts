import BaseSchema from "./base.schema";
import {UserDBModel, UserDocument} from "../models/user.db.model";
import {CodeConstant} from "../../../common/constants/code.constant";
import {DataBaseConstant} from "../../common/constants/database.constant";
import DivisionSaveSchema from "./division.save.schema";

export {UserDBModel, UserDocument};

export class UserSchema extends BaseSchema<UserDBModel> {
    constructor() {
        const schema: Object =
            {
                userId: { type: String, required: true, maxlength: 6, minlength: 6 },
                password: { type: String, required: true },
                name: {
                    first: { type: String, required: true, maxlength: 20 },
                    last: { type: String, required: true, maxlength: 20 }
                },
                role: { type: BaseSchema.getSchema(DivisionSaveSchema), required: true },
                mode: { type: BaseSchema.getSchema(DivisionSaveSchema), required: true }
            };

        super(schema);
    }

    public getCollectionName() {
        return DataBaseConstant.Collections.USER;
    }

    public getModelType() {
        return UserDBModel;
    }
}

export default UserSchema;
