import {Mongoose, Connection as MongooseConnection, Model } from "mongoose";

import {lifecycle, LifeCycle} from "../common/container/inject.decorator";
import {BaseSchema, BaseDBModel, BaseDocument} from "./schemas/base.schema";

const logger = require("../common/utils/log.util").db;

@lifecycle(LifeCycle.Singleton)
class Connection {
    private models: Map<BaseSchema<BaseDBModel<BaseDocument>>, Model<BaseDocument>> =
    new Map<BaseSchema<BaseDBModel<BaseDocument>>, Model<BaseDocument>>();

    private instance: Mongoose;
    private database: MongooseConnection;

    constructor(config: { host: string, database: string, port: number, options: any }) {
        this.instance = new Mongoose();
        this.database = this.instance.createConnection(config.host,
            config.database, config.port, config.options);
        this.instance.set("debug", (collectionName, method, query, doc, options) => {
            logger.info("[" + collectionName + "][" + method + "]\r\n" +
                "[query:" + logger.object2String(query) + "]\r\n" +
                "[doc:" + logger.object2String(doc) + "]\r\n" +
                "[options:" + logger.object2String(options) + "]");
        });
    }

    public model<D extends BaseDocument>(schema: BaseSchema<BaseDBModel<D>>): Model<D> {
        if (!this.models.has(schema))
            this.models.set(schema, this.database.model<D>(schema.getCollectionName(), schema));

        return <Model<D>>this.models.get(schema);
    }
}

export default Connection;
