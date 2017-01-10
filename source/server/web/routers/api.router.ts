import * as express from "express";

import * as common from "./router.common";
import domainerrorhandler from "../handlers/domain.error.handler";
import errorhandler from "../handlers/error.handler";
import jsonerrorhandler from "../handlers/json.error.handler";

const router: express.Router = express.Router();

router.use(domainerrorhandler(jsonerrorhandler));

router.get("/:controller/:method", function(req: express.Request
    , res: express.Response, next: (error?: Error) => void) {
    common.execute(req, res, next, "api");
});

router.use(errorhandler);
router.use(jsonerrorhandler);

export = router;
