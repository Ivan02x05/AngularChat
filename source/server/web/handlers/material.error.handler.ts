import * as express from "express";
import * as status from "http-status-codes";

import Exception from "../../common/exceptions/exception";

export default function handle(error: Exception, req: express.Request,
    res: express.Response, next: (error?: Error) => void) {
    res.status(status.NOT_FOUND).end();
}
