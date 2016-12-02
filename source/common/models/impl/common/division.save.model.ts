import BaseModel from "./base.model";
import IDivisionSaveModel from "../../common/division.save.model.interface";

export class DivisionSaveModel extends BaseModel implements IDivisionSaveModel {
    public subcode: string;
    public value: string;

    constructor(obj?: any) {
        super(obj);

        this.setValues("subcode", String, obj);
        this.setValues("value", String, obj);
    }
}

export default DivisionSaveModel;
