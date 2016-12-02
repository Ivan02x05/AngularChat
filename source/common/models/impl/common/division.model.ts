import IDivisionModel from "../../common/division.model.interface";
import BaseModel from "./base.model";

export class DivisionModel extends BaseModel implements IDivisionModel {
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

export default DivisionModel;
