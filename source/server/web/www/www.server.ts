import * as Q from "q";
import * as express from "express";
import * as session from "express-session";
import * as cookieparser from "cookie-parser";
import * as bodyparser from "body-parser";
import * as http from "http";
import * as path from "path";

const favicon = require("serve-favicon");
const uuid = require("uuid");
const redis = require('connect-redis')(session);

import domainerrorhandler from "../handlers/domain.error.handler";
import errorhandler from "../handlers/error.handler";
import redirecterrorhandler from "../handlers/redirect.error.handler";
import {decode as sessiondecoder} from "../handlers/session.handler";
import {lifecycle, LifeCycle} from "../../common/container/inject.decorator";
import SessionModel from "../../../common/models/io/common/session.io.model";

const BASE_DIR = path.join(__dirname, "../../");
const config = require("../../common/resources/config/www/www.json");
const logger = require("../../common/utils/log.util").www;

@lifecycle(LifeCycle.Singleton)
class WwwServer {
    public store: session.Store;
    public app: express.Express;
    public server: http.Server;

    public initialize() {
        this.createStore();
        this.createApp();
        this.createServer();
    }

    private createStore() {
        this.store = <session.Store>new redis(
            {
                host: config.redis.host,
                port: config.redis.port,
                prefix: config.redis.prefix,
            }
        );
    }

    private createApp() {
        this.app = express();

        this.app.set("port", config.port);
        this.app.set("views", path.join(BASE_DIR, "web/views"));
        this.app.set("view engine", "jade");

        this.app.use(domainerrorhandler(redirecterrorhandler));
        this.app.use(cookieparser(config.session_secret_key));
        this.app.use(bodyparser.json());
        this.app.use(session(
            <session.SessionOptions>{
                name: config.session_name,
                secret: config.session_secret_key,
                store: this.store,
                resave: true,
                saveUninitialized: false,
                genid: (req: express.Request): string => {
                    return uuid.v4();
                }
            }
        ));
        this.app.use(sessiondecoder);
        this.app.use(require("express-json")());
        this.app.use(favicon(path.join(BASE_DIR, "../client/images/favicon.ico")));
        this.app.use("/scripts", express.static(path.join(BASE_DIR, "../client/scripts")));
        this.app.use("/images", express.static(path.join(BASE_DIR, "../client/images")));
        this.app.use("/styles", express.static(path.join(BASE_DIR, "../client/styles")));
        this.app.use("/framework", express.static(path.join(BASE_DIR, "../client/framework")));
        this.app.use("/framework", express.static(path.join(BASE_DIR, "../../node_modules")));
        this.app.use("/common", express.static(path.join(BASE_DIR, "../common")));
        this.app.use(logger);
        this.app.use("/api", require("../routers/api.router"));
        this.app.use("/material", require("../routers/material.router"));
        this.app.use(require("../routers/www.router"));
        // default error handler
        this.app.use(errorhandler);
        this.app.use(redirecterrorhandler);
    }

    private createServer() {
        this.server = http.createServer(this.app);
    }

    public listen() {
        this.server.listen(this.app.get("port"), () => {
            console.log("Wwwサーバー起動。");
        });
    }
}

export default WwwServer;
