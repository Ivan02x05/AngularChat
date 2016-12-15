import * as express from "express";

import Exception from "../../common/exceptions/exception";
import {ErrorConstant} from "../../../common/constants/error.constant";

var logger = require("../../common/utils/log.util").error;

export default function handle(error: Error, req: express.Request,
    res: express.Response, next: (error?: Error) => void) {

    var loginInfo = null;
    if ((<any>req).session)
        loginInfo = (<any>req).session.user;
    var log = {
        error: error,
        login: loginInfo
    };

    var exception: Exception;
    if (!(error instanceof Exception)
        || ((<Exception>error).level > ErrorConstant.ErrorLevel.Error
            && (<Exception>error).errors[0].code != ErrorConstant.Code.Fatal.SESSION_TIMEOUT)) {
        exception = new Exception(ErrorConstant.Code.Fatal.UN_DEFINED);
        logger.fatal(log);
    } else {
        exception = <Exception>error;
        logger.error(log);
    }

    next(exception);
}
