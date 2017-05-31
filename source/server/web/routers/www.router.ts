import * as express from "express";

import * as common from "./router.common";
import domainerrorhandler from "../handlers/domain.error.handler";
import errorhandler from "../handlers/error.handler";
import jsonerrorhandler from "../handlers/json.error.handler";
import redirecterrorhandler from "../handlers/redirect.error.handler";
import authhandler from "../handlers/auth.handler";

const router: express.Router = express.Router();

router.get("/", domainerrorhandler(redirecterrorhandler), function(req: express.Request
    , res: express.Response, next: Function) {
    req.params.controller = "login";
    req.params.method = "index";

    common.execute(req, res, next);
});

router.get("/:controller(keepalived)/:method(check)", function (req, res, next) {
    res.end();
});

router.use("/login/index", domainerrorhandler(redirecterrorhandler));
router.use("/:controller/:method", domainerrorhandler(jsonerrorhandler));

router.get("*", function(req: express.Request
    , res: express.Response, next: Function) {
    // redirect to index
    var url = "";
    req.originalUrl
        .split("/")
        .forEach((u: string) => {
            var i: number = u.indexOf("?");
            if (i > -1)
                u = u.substring(0, i);

            if (u != "")
                url += "../";
        });

    res.redirect(url);
});

router.post("/:controller(login)/:method(login|logout)", function(req: express.Request
    , res: express.Response, next: (error?: Error) => void) {
    common.execute(req, res, next);
});

router.post("/:controller/:method", authhandler, function(req: express.Request
    , res: express.Response, next: (error?: Error) => void) {
    common.execute(req, res, next);
});

router.use(errorhandler);
router.use("/login/index", redirecterrorhandler);
router.use("/:controller/:method", jsonerrorhandler);

export = router;
