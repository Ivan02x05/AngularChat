/// <reference path="../../../../typings/tsd.d.ts"/>

import * as express from "express";
import * as session from "express-session";
import * as cookieparser from "cookie-parser";
import * as bodyparser from "body-parser";
import * as http from "http";
import * as path from "path";
import * as Q from "q";

var favicon = require("serve-favicon");
var uuid = require("uuid");

import initializer from "../settings/initialize";
import errorhandler from "../handlers/error.handler";
import redirecterrorhandler from "../handlers/redirect.error.handler";
import {decode as sessiondecoder} from "../handlers/session.handler";

const BASE_DIR = path.join(process.cwd(), "bin/server");
const config = require("../../common/resources/config/www/www.json");
const logger = require("../../common/utils/log.util").www;

var sessionOptions = (
    () => {
        return <session.SessionOptions>{
            name: config.session_name,
            secret: config.session_secret_key,
            store: new session.MemoryStore(),
            resave: true,
            saveUninitialized: false,
            genid: (req: express.Request): string => {
                return uuid.v4();
            }
        };
    }
)();

function createApp(): { app: express.Express, session: session.SessionOptions } {

    var app: express.Express = express();
    var so = sessionOptions;

    app.set("port", config.port);
    app.set("views", path.join(BASE_DIR, "web/views"));
    app.set("view engine", "jade");

    app.use(cookieparser(config.session_secret_key));
    app.use(bodyparser.json());
    app.use(session(so));
    app.use(sessiondecoder);
    app.use(require("express-json")());
    app.use(favicon(path.join(BASE_DIR, "../client/images/favicon.ico")));
    app.use("/scripts", express.static(path.join(BASE_DIR, "../client/scripts")));
    app.use("/images", express.static(path.join(BASE_DIR, "../client/images")));
    app.use("/styles", express.static(path.join(BASE_DIR, "../client/styles")));
    app.use("/framework", express.static(path.join(BASE_DIR, "../client/framework")));
    app.use("/framework", express.static(path.join(BASE_DIR, "../../node_modules")));
    app.use("/common", express.static(path.join(BASE_DIR, "../common")));
    app.use(logger);
    app.use("/api", require("../routers/api.router"));
    app.use("/material", require("../routers/material.router"));
    app.use(require("../routers/www.router"));
    // default error handler
    app.use(errorhandler);
    app.use(redirecterrorhandler);

    return {
        app: app,
        session: so
    };
}

function initialize(): Q.Promise<void> {
    return initializer();
}

export default function www()
    : Q.Promise<{ server: http.Server, session: session.SessionOptions }> {

    return initialize()
        .then(() => createApp())
        .then(_ => {
            return {
                server: <http.Server>http.createServer(_.app)
                    .listen(_.app.get("port")),
                session: _.session
            }
        });
}
