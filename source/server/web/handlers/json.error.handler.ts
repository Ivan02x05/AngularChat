import * as express from "express";
import * as status from "http-status-codes";

import Exception from "../../common/exceptions/exception";
import ResponseIOModel from "../../../common/models/io/common/response.io.model";
import {ErrorConstant} from "../../../common/constants/error.constant";

export default function handle(error: Exception, req: express.Request,
    res: express.Response) {

    const model = new ResponseIOModel();
    model.errors = error.errors;

    if (error.level > ErrorConstant.ErrorLevel.Error)
        res.status(status.INTERNAL_SERVER_ERROR);

    res.json(model);
}
