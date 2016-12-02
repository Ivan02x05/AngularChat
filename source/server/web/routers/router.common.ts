/// <reference path="../../../../typings/tsd.d.ts"/>

import * as express from "express";

import WWWBaseController from "../controllers/common/www.base.controller";
import {Container} from "../../common/container/container";

export function execute(req: express.Request, res: express.Response, next: Function, namespace: string = "www") {
    var target: string = (<string>req.params.controller).toLowerCase();
    if (namespace.substring(namespace.length - 1) != "/")
        namespace += "/";

    var type: WWWBaseController = require("../controllers/" + namespace + target + ".controller").default;
    var instance: WWWBaseController = Container.resolve(type, req, [req, res]);

    instance.exec()
        .catch((error: Error) => {
            next(error);
        })
        .finally(() => {
            Container.remove(null, req);
        });
};
