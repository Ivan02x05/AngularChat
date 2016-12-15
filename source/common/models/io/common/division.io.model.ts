import IDivisionModel from "../../if/common/division.model.interface";
import BaseIOModel from "./base.io.model";

export class DivisionIOModel extends BaseIOModel implements IDivisionModel {
    public code: string;
    public subcode: string;
    public value: string;

    constructor(obj?: any) {
        super(obj);

        this.setValues("code", String, obj);
        this.setValues("subcode", String, obj);
        this.setValues("value", String, obj);
    }
}

export default DivisionIOModel;
