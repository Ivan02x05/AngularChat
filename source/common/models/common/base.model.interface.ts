import ISystemColumn from "./system.column.model.interface";

export interface IBaseModel {
    _id: any;
    systemColumn?: ISystemColumn
}

export default IBaseModel;
