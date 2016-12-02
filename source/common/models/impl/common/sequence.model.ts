import ISequenceModel from "../../common/sequence.model.interface";
import BaseModel from "./base.model";

export class SequenceModel extends BaseModel implements ISequenceModel {
    public name: string;
    public seq: number;

    constructor(obj?: any) {
        super(obj);

        this.setValues("name", String, obj);
        this.setValues("seq", Number, obj);
    }
}

export default SequenceModel;
