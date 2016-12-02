/// <reference path="../../../../typings/tsd.d.ts"/>

import * as Q from "q";
import {Model, Query, Types, FindAndUpdateOption}  from "mongoose";

import BaseSchema from "../schemas/base.schema";
import BaseDocument from "../documents/base.document";
import IBaseModel from "../../../common/models/common/base.model.interface";
import ErrorModel from "../../../common/models/impl/common/error.model";
import Exception from "../../common/exceptions/exception";
import DataBaseException from "../../common/exceptions/database.exception";
import {ErrorConstant} from "../../../common/constants/error.constant";
import {lifecycle, LifeCycle} from "../../common/container/inject.decorator";

export {BaseDocument};

import DataBase from "../database";

export class QueryToken<T>{
    private deferred: Q.Deferred<T>;

    constructor() {
        this.deferred = Q.defer<T>();
    }

    public get promise(): Q.Promise<T> {
        return this.deferred.promise;
    }

    public resolve(value?: T) {
        this.deferred.resolve(value);
    }

    public reject(error: string | Exception, params?: string[]) {
        QueryToken.reject(error, params)
            .catch((exception: Exception) => {
                this.deferred.reject(exception);
            });
    }

    public handleQuery(error: Error): Q.Promise<T> {
        return QueryToken.handleQuery(error)
            .catch((exception: Exception) => {
                this.reject(exception);
                return Q.reject<T>(null);
            });
    }

    public static reject<T>(error: string | Exception, params?: string[]): Q.Promise<T> {
        var exception: Exception;
        if (error instanceof Exception)
            exception = <Exception>error;
        else
            exception = new Exception(<string>error, params);

        return Q.reject<T>(exception);
    }

    public static handleQuery<T>(error: any): Q.Promise<T> {
        if (error) {
            if (error instanceof Exception)
                return QueryToken.reject<T>(error);
            else if (error.errors) {
                // validate error
                var validateErrors: ErrorModel[] = []
                for (var key in error.errors) {
                    var error = error.errors[key];
                    if (error.properties
                        && error.properties.error
                        && error.properties.error instanceof Exception) {
                        (<Exception>error.properties.error).errors
                            .forEach(_ => {
                                validateErrors.push(_);
                            });
                    } else
                        // has other error
                        return QueryToken.reject<T>(new DataBaseException(error));
                }

                if (validateErrors.length > 0)
                    return QueryToken.reject<T>(new DataBaseException(validateErrors));
            }

            return QueryToken.reject<T>(new DataBaseException(error));
        }

        return Q.resolve<T>(null);
    }
}

@lifecycle(LifeCycle.Prototype)
export abstract class BaseModel<D extends BaseDocument> {
    protected model: Model<D>;

    constructor(model: Model<D>) {
        this.model = model;
    }

    protected token<T>(): QueryToken<T> {
        return new QueryToken<T>();
    }

    public save(document: D): Q.Promise<D> {
        var token = this.token<D>();
        document.creator = this;
        document.save((error, result: D) => {
            token.handleQuery(error)
                .then(() => {
                    token.resolve(result);
                });
        });
        return token.promise;
    }

    public findById(id: string, fields?: Object, options?: Object): Q.Promise<D> {
        var token = this.token<D>();
        var cb = (error, result: D) => {
            token.handleQuery(error)
                .then(() => {
                    token.resolve(result);
                });
        };
        if (options)
            this.model.findById(id, fields, options, cb);
        else if (fields)
            this.model.findById(id, fields, cb);
        else
            this.model.findById(id, cb);
        return token.promise;
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
        var token = this.token<D[]>();
        var cb = (error, result: D[]) => {
            token.handleQuery(error)
                .then(() => {
                    token.resolve(result);
                });
        };
        if (options)
            this.model.find(cond, fields, options, cb);
        else if (fields)
            this.model.find(cond, fields, cb);
        else
            this.model.find(cond, cb);
        return token.promise;
    }

    public findByIdAndUpdate(id: any, update: Object, options?: FindAndUpdateOption): Q.Promise<D> {
        var token = this.token<D>();
        var cb = (error, result: D) => {
            token.handleQuery(error)
                .then(() => {
                    token.resolve(result);
                });
        };
        if (options)
            this.model.findByIdAndUpdate(id, update, options, cb);
        else
            this.model.findByIdAndUpdate(id, update, cb);
        return token.promise;
    }

    public findOneAndUpdate(cond: Object, update: Object, options?: FindAndUpdateOption): Q.Promise<D> {
        var token = this.token<D>();
        var cb = (error, result: D) => {
            token.handleQuery(error)
                .then(() => {
                    token.resolve(result);
                });
        };
        if (options)
            this.model.findOneAndUpdate(cond, update, options, cb);
        else
            this.model.findOneAndUpdate(cond, update, cb);
        return token.promise;
    }

    public aggregate(...aggregations: Object[]): Q.Promise<D[]> {
        var token = this.token<D[]>();
        var cb = (error, result: D[]) => {
            token.handleQuery(error)
                .then(() => {
                    token.resolve(result);
                });
        };

        this.model.aggregate(aggregations)
            .exec(cb);
        return token.promise;
    }

    public toDocument<T extends IBaseModel>(data?: T): D {
        // clone for delete _id field
        var clone = Object.assign({}, data);
        delete clone._id;
        var document: D = new this.model(clone);
        document.creator = this;
        return document;
    }

    public get id(): string {
        return BaseModel.id;
    }

    public toObjectId(id: string): Types.ObjectId {
        return BaseModel.toObjectId(id);
    }

    public get sysDate(): Date {
        return BaseModel.sysDate;
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

export default BaseModel;
