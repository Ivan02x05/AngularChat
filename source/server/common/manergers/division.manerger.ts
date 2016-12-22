import * as Q from "q";

import DivisionIOModel from "../../../common/models/io/common/division.io.model";
import {lifecycle, LifeCycle, inject} from "../container/inject.decorator";
import DataBase from "../../database/database";
import DivisionSchema from "../../database/schemas/division.schema";
import Container from "../../common/container/container";

@lifecycle(LifeCycle.Singleton)
class DivisionManerger {
    private _divisions: Map<string, Map<string, DivisionIOModel>> =
    new Map<string, Map<string, DivisionIOModel>>();

    public initialize(): Q.Promise<void> {
        return this.create();
    }

    @inject([{ clazz: DataBase }])
    private create(database?: DataBase): Q.Promise<void> {
        return database.model(DivisionSchema)
            .find({ "systemColumn.deleteFlag": false })
            .then((data) => {
                data.forEach((_) => {
                    if (!this._divisions.has(_.code))
                        this._divisions.set(_.code, new Map<string, DivisionIOModel>());

                    this._divisions.get(_.code).set(_.subcode, new DivisionIOModel(_));
                });
            })
    }

    public getDivision(code: string, subcode: string): DivisionIOModel {
        if (this._divisions.has(code)
            && this._divisions.get(code).has(subcode))
            return this._divisions.get(code).get(subcode);
        else
            return null;
    }

    public getValue(code: string, subcode: string): string {
        const division = this.getDivision(code, subcode);
        if (division != null)
            return division.value;
        else
            return null;
    }

    public get divisions(): Map<string, Map<string, DivisionIOModel>> {
        return this._divisions;
    }
}

export default DivisionManerger;
