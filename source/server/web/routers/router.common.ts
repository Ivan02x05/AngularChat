import * as express from "express";

import WwwBaseController from "../controllers/common/www.base.controller";
import {Container} from "../../common/container/container";

export function execute(req: express.Request, res: express.Response, next: Function, namespace: string = "www") {
    const target = (<string>req.params.controller).toLowerCase();
    if (namespace.substring(namespace.length - 1) != "/")
        namespace += "/";

    // regist request/response for Container
    const container = new Container(req);
    container.registInstance(res);
    const type: WwwBaseController = require("../controllers/" + namespace + target + ".controller").default;
    const instance: WwwBaseController = container.resolve(type);

    instance.exec()
        .catch((error: Error) => {
            next(error);
        })
        .finally(() => {
            Container.remove(null, req);
        });
};
