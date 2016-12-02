/// <reference path="../../../../typings/tsd.d.ts"/>

import * as express from "express";

import Exception from "../../common/exceptions/exception";
import {SystemConstant} from "../../../common/constants/system.constant";

export default function handle(error: Exception, req: express.Request,
    res: express.Response, next: (error?: Error) => void) {

    res.render("error", { error: error, systemname: SystemConstant.SYSTEM_NAME });
}
