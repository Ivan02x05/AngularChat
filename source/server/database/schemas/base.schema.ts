/// <reference path="../../../../typings/tsd.d.ts"/>

import {Schema}  from "mongoose";
import {lifecycle, LifeCycle} from "../../common/container/inject.decorator";
import {Container} from "../../common/container/container";
import {BaseModel, BaseDocument} from "../models/base.model";

export {BaseModel, BaseDocument};

@lifecycle(LifeCycle.Singleton)
export abstract class BaseSchema<M extends BaseModel<BaseDocument>> extends Schema {
    protected options: any;

    constructor(schema: any, options: any = {}) {
        super(schema, options);

        this.options = options;

        var name = this.getCollectionName();
        if (name != null)
            this.set("collection", name);
    }

    public abstract getCollectionName(): string;
    public abstract getModelType(): { new (database: any, schema: any): M };

    public static getSchema<S extends BaseSchema<M>, M extends BaseModel<D>, D extends BaseDocument>(
        schema: { new (): BaseSchema<M> }): S {

        var exists = Container.exists(schema);
        var sch = <S>Container.resolve(schema);
        if (!exists && sch.get("collection") != null)
            sch.plugin(require("../plugins/common_columns.plugin"), sch.options);

        return sch;
    }
}

export default BaseSchema;
