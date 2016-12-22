import BaseIOModel from "../../../common/models/io/common/base.io.model";
import ErrorIOModel from "../../../common/models/io/common/error.io.model";

class ServiceResult {
    private _models: Map<string, any | any[]> = new Map<string, any | any[]>();
    private _errors: ErrorIOModel[] = [];

    public get models(): Map<string, any | any[]> {
        return this._models;
    }

    public get errors(): ErrorIOModel[] {
        return this._errors;
    }

    public add(key: string | ErrorIOModel, value: any | any[]) {
        if (key instanceof ErrorIOModel) {
            this._errors.push(<ErrorIOModel>key);
        } else {
            if (!this._models.has(<string>key))
                this._models.set(<string>key, value);
        }
    }

    public remove(key: string | number): any | any[] | ErrorIOModel {
        if (typeof (key) == "string") {
            if (this._models.has(<string>key)) {
                const model = this._models.get(<string>key);
                this._models.delete(<string>key);

                return model;
            }

            return null;
        } else {
            if (this._errors.length > <number>key)
                return this._errors.splice(<number>key, 1)[0];
        }
    }

    public get(key: string | number): any | any[] | ErrorIOModel {
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
