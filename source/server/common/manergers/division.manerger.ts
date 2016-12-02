/// <reference path="../../../../typings/tsd.d.ts"/>

import * as Q from "q";

import DivisionModel from "../../../common/models/impl/common/division.model";
import {lifecycle, LifeCycle, inject} from "../container/inject.decorator";
import DataBase from "../../database/database";
import DivisionSchema from "../../database/schemas/division.schema";
import Container from "../../common/container/container";

@lifecycle(LifeCycle.Singleton)
@inject([{ clazz: DataBase }])
class DivisionManerger {
    private static deferred: Q.Deferred<void> = Q.defer<void>();

    private _divisions: Map<string, Map<string, DivisionModel>> =
    new Map<string, Map<string, DivisionModel>>();

    constructor(database?: DataBase) {
        this.create(database);
    }

    private create(database: DataBase) {
        database.model(DivisionSchema)
            .find({ "systemColumn.deleteFlag": false })
            .then((data) => {
                data.forEach((_) => {
                    if (!this._divisions.has(_.code))
                        this._divisions.set(_.code, new Map<string, DivisionModel>());

                    this._divisions.get(_.code).set(_.subcode, new DivisionModel(_));
                })
                DivisionManerger.deferred.resolve();
            });
    }

    public static initialize(): Q.Promise<void> {
        Container.regist(DivisionManerger);
        return DivisionManerger.deferred.promise;
    }

    public getDivision(code: string, subcode: string): DivisionModel {
        if (this._divisions.has(code)
            && this._divisions.get(code).has(subcode))
            return this._divisions.get(code).get(subcode);
        else
            return null;
    }

    public getValue(code: string, subcode: string): string {
        var division = this.getDivision(code, subcode);
        if (division != null)
            return division.value;
        else
            return null;
    }

    public get divisions(): Map<string, Map<string, DivisionModel>> {
        return this._divisions;
    }
}

export default DivisionManerger;
