import IBaseModel from "./base.model.interface";

export interface ISequenceModel extends IBaseModel {
    name: string;
    seq: number;
}

export default ISequenceModel;
