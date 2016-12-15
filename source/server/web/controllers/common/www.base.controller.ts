import * as express from "express";
import * as Q from "q";
import * as mime from "mime";

var requestInject = require("express"),
    request = requestInject.request.constructor,
    response = requestInject.response.constructor;

export * from "./base.controller";
import {BaseController} from "./base.controller";
import BaseIOModel from "../../../../common/models/io/common/base.io.model";
import SessionIOModel from "../../../../common/models/io/common/session.io.model";
import ServiceResult from "../../../service/common/service.result";
import ResponseIOModel from "../../../../common/models/io/common/response.io.model";
import * as fileutils from "../../../common/utils/file.util";
import {inject} from "../../../common/container/inject.decorator";

@inject([{ clazz: request }, { clazz: response }])
export abstract class WwwBaseController extends BaseController {
    protected _req: express.Request;
    protected _res: express.Response;

    public get request(): express.Request {
        return this._req;
    }

    public get response(): express.Response {
        return this._res;
    }

    public get session(): SessionIOModel {
        return this.getSession();
    }

    public getSession(): SessionIOModel {
        return <SessionIOModel>(<any>this.request).session;
    }

    constructor(req?: express.Request, res?: express.Response) {
        super();

        this._req = req;
        this._res = res;
    }

    public exec(): Q.Promise<void> {
        return this.execMethod(this.request.params.method);
    }

    protected json(result: ServiceResult | ResponseIOModel) {
        var model: ResponseIOModel;
        if (result instanceof ServiceResult)
            model = this.resultToIOModel(<ServiceResult>result);
        else
            model = <ResponseIOModel>result;

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

export default WwwBaseController;
