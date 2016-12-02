/// <reference path="../../../../../typings/tsd.d.ts"/>

import * as express from "express";
import * as Q from "q";
import * as mime from "mime";

import BaseController from "./base.controller";
import BaseModel from "../../../../common/models/impl/common/base.model";
import SessionModel from "../../../../common/models/impl/common/session.model";
import ServiceResult from "../../../service/common/service.result";
import ResponseModel from "../../../../common/models/impl/common/response.model";
import * as fileutils from "../../../common/utils/file.util";

abstract class WWWBaseController extends BaseController {
    protected _req: express.Request;
    protected _res: express.Response;

    public get request(): express.Request {
        return this._req;
    }

    public get response(): express.Response {
        return this._res;
    }

    public get session(): SessionModel {
        return this.getSession();
    }

    public getSession(): SessionModel {
        return <SessionModel>(<any>this.request).session;
    }

    constructor(req: express.Request, res: express.Response) {
        super();

        this._req = req;
        this._res = res;
    }

    public exec(): Q.Promise<any> {
        return this.execMethod(this.request.params.method);
    }

    protected json(result: ServiceResult | ResponseModel) {
        var model: ResponseModel;
        if (result instanceof ServiceResult)
            model = this.resultToModel(<ServiceResult>result);
        else
            model = <ResponseModel>result;

        this.response.json(model);
    }

    protected file(file: { path: string, name: string }) {
        return fileutils.readFile(file)
            .then(_ => {
                this.response.set("Content-Type", mime.lookup(file.name));
                this.response.send(_);
            });
    }
}

export default WWWBaseController;
