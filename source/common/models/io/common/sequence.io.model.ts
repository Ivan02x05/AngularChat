import ISequenceModel from "../../if/common/sequence.model.interface";
import BaseIOModel from "./base.io.model";

export class SequenceIOModel extends BaseIOModel implements ISequenceModel {
    public name: string;
    public seq: number;

    constructor(obj?: any) {
        super(obj);

        this.setValues("name", String, obj);
        this.setValues("seq", Number, obj);
    }
}

export default SequenceIOModel;
