/// <reference path="../../../../typings/tsd.d.ts"/>

import * as express from "express";
import * as status from "http-status-codes";

import Exception from "../../common/exceptions/exception";
import {ErrorConstant} from "../../../common/constants/error.constant";

export default function handle(req: express.Request,
    res: express.Response, next: (error?: Error) => void) {

    if ((<any>req).session && (<any>req).session.user)
        next();
    else {
        if (res != null)
            res.status(status.UNAUTHORIZED);

        next(new Exception(ErrorConstant.Code.Fatal.SESSION_TIMEOUT));
    }
}
