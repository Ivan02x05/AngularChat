import BaseModel from "../../../common/models/impl/common/base.model";
import ErrorModel from "../../../common/models/impl/common/error.model";

class ServiceResult {
    private _models: Map<string, any | any[]> = new Map<string, any | any[]>();
    private _errors: ErrorModel[] = [];

    constructor() {
    }

    public get models(): Map<string, any | any[]> {
        return this._models;
    }

    public get errors(): ErrorModel[] {
        return this._errors;
    }

    public add(key: string | ErrorModel, value: any | any[]) {
        if (key instanceof ErrorModel) {
            this._errors.push(<ErrorModel>key);
        } else {
            if (!this._models.has(<string>key))
                this._models.set(<string>key, value);
        }
    }

    public remove(key: string | number): any | any[] | ErrorModel {
        if (typeof (key) == "string") {
            if (this._models.has(<string>key)) {
                var model = this._models.get(<string>key);
                this._models.delete(<string>key);

                return model;
            }

            return null;
        } else {
            if (this._errors.length > <number>key)
                return this._errors.splice(<number>key, 1)[0];
        }
    }

    public get(key: string | number): any | any[] | ErrorModel {
        if (typeof (key) == "string") {
            if (this._models.has(<string>key))
                return <any | any[]>this._models.get(<string>key);
        } else {
            if (this._errors.length > <number>key)
                return this._errors[<number>key];
        }
    }
}

export default ServiceResult;
