import * as express from "express";

import * as common from "./router.common";
import errorhandler from "../handlers/error.handler";
import jsonerrorhandler from "../handlers/json.error.handler";

var router: express.Router = express.Router();

router.get("/:controller/:method", function(req: express.Request
    , res: express.Response, next: (error?: Error) => void) {
    common.execute(req, res, next, "api");
});

router.use(errorhandler);
router.use(jsonerrorhandler);

export = router;
