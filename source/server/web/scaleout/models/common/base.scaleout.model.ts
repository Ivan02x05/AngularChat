import BaseIOModel from "../../../../../common/models/io/common/base.io.model";

export class BaseScaleoutModel {
    public sender: string;

    constructor(obj?: any) {
        BaseIOModel.setValues(this, "sender", String, obj);
    }
}

export default BaseScaleoutModel;
