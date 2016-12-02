/// <reference path="../../../../typings/tsd.d.ts"/>

import * as express from "express";
import * as status from "http-status-codes";

import Exception from "../../common/exceptions/exception";
import ResponseModel from "../../../common/models/impl/common/response.model";
import {ErrorConstant} from "../../../common/constants/error.constant";

export default function handle(error: Exception, req: express.Request,
    res: express.Response, next: (error?: Error) => void) {

    var model: ResponseModel = new ResponseModel();
    model.errors = error.errors;

    if (error.level > ErrorConstant.ErrorLevel.Error)
        res.status(status.INTERNAL_SERVER_ERROR);

    res.json(model);
}
