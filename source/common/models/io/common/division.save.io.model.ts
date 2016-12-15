import IDivisionSaveModel from "../../if/common/division.save.model.interface";
import BaseIOModel from "./base.io.model";

export class DivisionSaveIOModel extends BaseIOModel implements IDivisionSaveModel {
    public subcode: string;
    public value: string;

    constructor(obj?: any) {
        super(obj);

        this.setValues("subcode", String, obj);
        this.setValues("value", String, obj);
    }
}

export default DivisionSaveIOModel;
