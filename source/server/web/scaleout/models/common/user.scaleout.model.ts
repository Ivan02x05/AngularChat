import BaseIOModel from "../../../../../common/models/io/common/base.io.model";
import UserIOModel from "../../../../../common/models/io/common/user.io.model";
import BaseScaleoutModel from "./base.scaleout.model";

export class UserScaleoutModel extends BaseScaleoutModel {
    public user: UserIOModel;

    constructor(obj?: any) {
        super(obj);

        BaseIOModel.setValues(this, "user", UserIOModel, obj);
    }
}

export default UserScaleoutModel;
