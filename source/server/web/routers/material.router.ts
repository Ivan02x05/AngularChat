import * as express from "express";

import * as common from "./router.common";
import domainerrorhandler from "../handlers/domain.error.handler";
import errorhandler from "../handlers/error.handler";
import materialerrorhandler from "../handlers/material.error.handler";
import authhandler from "../handlers/auth.handler";

const router: express.Router = express.Router();

router.use(domainerrorhandler(materialerrorhandler));

router.get("/:controller/:method", authhandler, function(req: express.Request
    , res: express.Response, next: (error?: Error) => void) {
    common.execute(req, res, next);
});

router.use(errorhandler);
router.use(materialerrorhandler);

export = router;
