import IBaseModel from "../../common/base.model.interface";
import SystemColumnModel from "./system.column.model";


export class BaseModel implements IBaseModel {
    public _id: any;
    public systemColumn: SystemColumnModel;

    constructor(obj?: any) {
        this.setValues("_id", String, obj);
        this.setValues("systemColumn", SystemColumnModel, obj);
    }

    protected setValues<T, F extends (...args) => T>(name: string, type: { new (obj?: any): T } | F, value: any, def: T | T[] = null) {
        BaseModel.setValues(this, name, type, value, def);
    }

    public get dbobject() {
        return JSON.parse(JSON.stringify(this));
    }

    public static setValues<T, F extends (...args) => T>(target: any, name: string, type: { new (obj?: any): T } | F, value: any, def: T | T[] = null) {
        target[name] = def;

        if (target == null)
            return;

        if (name == null)
            return;

        if (value == null)
            return;

        if (value[name] == null)
            return;

        target[name] = BaseModel.convertValue(type, value[name]);
    }

    public static convertValue<T, F extends (value: any) => T>(type: { new (obj?: any): T } | F, value: any): T {
        if (value == null)
            return value;

        if (type == null)
            return value;

        if (Array.isArray(value)) {
            return value.map(_ => BaseModel.convertValue(type, _));
        } else if (value instanceof type) {
            return value;
        } else if (<any>type == String) {
            return value.toString();
        } else if (isFinite(value) && <any>type == Number) {
            return value;
        } else if (<any>type == Number) {
            return <any>parseInt(value);
        } else if (typeof value === "boolean" && <any>type == Boolean) {
            return <any>value;
        } else if (<any>type == Boolean) {
            return <any>new Boolean(value);
        } else if (type.prototype) {
            return new (<{ new (obj?: any): T }>type)(value);
        } else {
            try {
                return (<F>type)(value);
            } catch (ex) {
                return null;
            }
        }
    }
}

export default BaseModel;
