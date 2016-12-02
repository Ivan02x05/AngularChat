import BaseSchema from "./schemas/base.schema";
import BaseDocument from "./documents/base.document";
import BaseModel from "./models/base.model";
import Connection from "./connection";
import {Container, Cache} from "../common/container/container";
import {inject} from "../common/container/inject.decorator";
import DefaultConnection from "./default.connection";

@inject([{ clazz: DefaultConnection }])
export class DataBase {
    public connection: Connection;

    constructor(connection?: Connection) {
        this.connection = connection;
    }

    public model<S extends BaseSchema<M>, M extends BaseModel<D>, D extends BaseDocument>(
        schema: { new (): BaseSchema<M> }): M {

        var sch = BaseSchema.getSchema(schema);
        return Container.resolve(sch.getModelType(), this, [this.connection.model(sch)]);
    }
}

export default DataBase;
