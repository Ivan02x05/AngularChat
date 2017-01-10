import * as express from "express";

import Exception from "../../common/exceptions/exception";
import {SystemConstant} from "../../../common/constants/system.constant";

export default function handle(error: Exception, req: express.Request,
    res: express.Response) {

    res.render("error", { error: error, systemname: SystemConstant.SYSTEM_NAME });
}
