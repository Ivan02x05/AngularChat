import * as Q from "q";
import {Model, Query, Types, FindAndUpdateOption}  from "mongoose";

import BaseDocument from "../documents/base.document";
import IBaseModel from "../../../common/models/if/common/base.model.interface";
import ErrorIOModel from "../../../common/models/io/common/error.io.model";
import Exception from "../../common/exceptions/exception";
import DataBaseException from "../../common/exceptions/database.exception";
import {ErrorConstant} from "../../../common/constants/error.constant";
import {lifecycle, LifeCycle} from "../../common/container/inject.decorator";

export {BaseDocument};

import DataBase from "../database";

@lifecycle(LifeCycle.Prototype)
export abstract class BaseDBModel<D extends BaseDocument> {
    protected model: Model<D>;

    constructor(model: Model<D>) {
        this.model = model;
    }

    protected handleQuery(error: any) {
        if (error instanceof Exception)
            return Q.reject(error);
        else if (error.errors) {
            // validate error
            const validateErrors: ErrorIOModel[] = []
            for (let key in error.errors) {
                let e = error.errors[key];
                if (e.properties
                    && e.properties.error
                    && e.properties.error instanceof Exception) {
                    (<Exception>e.properties.error).errors
                        .forEach(_ => {
                            validateErrors.push(_);
                        });
                } else
                    // has other error
                    return Q.reject(new DataBaseException(error));
            }

            if (validateErrors.length > 0)
                return Q.reject(new DataBaseException(validateErrors));
        }

        return Q.reject(new DataBaseException(error));
    }

    public save(document: D): Q.Promise<D> {
        document.dbmodel = this;
        return Q.nfcall<D>(document.save.bind(document))
            .then(_ => _[0])
            .catch<D>(error => this.handleQuery(error));
    }

    public findById(id: string, fields?: Object, options?: Object): Q.Promise<D> {
        return Q.nfcall<D>(this.model.findById.bind(this.model), id, fields, options)
            .catch<D>(error => this.handleQuery(error));
    }

    public delete(model: IBaseModel): Q.Promise<D> {
        return this.findById(model._id)
            .then<D>(_ => {
                if (_ == null)
                    return Q.reject(new Exception(ErrorConstant.Code.Error.DATA_NOT_FOUND));

                if (model.systemColumn)
                    _.systemColumn.version = model.systemColumn.version;
                return _;
            })
            .then(_ => {
                if (model.systemColumn)
                    _.systemColumn.deleteFlag = true;
                return this.save(_);
            });
    }

    public find(cond: Object, fields?: Object, options?: Object): Q.Promise<D[]> {
        return Q.nfcall<D[]>(this.model.find.bind(this.model), cond, fields, options)
            .catch<D[]>(error => this.handleQuery(error));
    }

    public findByIdAndUpdate(id: any, update: Object, options?: FindAndUpdateOption): Q.Promise<D> {
        return Q.nfcall<D>(this.model.findByIdAndUpdate.bind(this.model), id, update, options)
            .catch<D>(error => this.handleQuery(error));
    }

    public findOneAndUpdate(cond: Object, update: Object, options?: FindAndUpdateOption): Q.Promise<D> {
        return Q.nfcall<D>(this.model.findOneAndUpdate.bind(this.model), cond, update, options)
            .catch<D>(error => this.handleQuery(error));
    }

    public aggregate(...aggregations: Object[]): Q.Promise<D[]> {
        return Q.nfcall<D[]>(this.model.aggregate.bind(this.model), aggregations)
            .catch<D[]>(error => this.handleQuery(error));
    }

    public toDocument<T extends IBaseModel>(data?: T): D {
        // clone for delete _id field
        const clone = Object.assign({}, data);
        delete clone._id;
        const document: D = new this.model(clone);
        document.dbmodel = this;
        return document;
    }

    public get id(): string {
        return BaseDBModel.id;
    }

    public toObjectId(id: string): Types.ObjectId {
        return BaseDBModel.toObjectId(id);
    }

    public get sysDate(): Date {
        return BaseDBModel.sysDate;
    }

    public static get id(): string {
        return new Types.ObjectId().toHexString();
    }

    public static toObjectId(id: string): Types.ObjectId {
        return new Types.ObjectId(id);
    }

    public static get sysDate(): Date {
        return new Date();
    }
}

export default BaseDBModel;
