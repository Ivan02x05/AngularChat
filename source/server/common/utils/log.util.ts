const log4js = require('log4js');
import {inspect} from "util";
import * as path from "path";
import * as Q from "q";

import Exception from "../exceptions/exception";
import * as fileutil from "./file.util";

const config = require("../resources/config/log/log.json");

const logger = (name: string) => {
    const logger = log4js.getLogger(name);
    const level = log4js.levels.toLevel(config.levels[name]);
    const object2String = (obj: any) => {
        return inspect(obj, false, null);
    };

    return {
        trace: (msg: string) => {
            logger.trace(msg);
        },
        debug: (msg: string) => {
            logger.debug(msg);
        },
        info: (msg: string) => {
            logger.info(msg);
        },
        warn: (msg: string) => {
            logger.warn(msg);
        },
        error: (ex: Exception) => {
            logger.error(object2String(ex));
        },
        fatal: (ex: Exception) => {
            logger.fatal(object2String(ex));
        },
        level: level,
        connect: () => {
            return log4js.connectLogger(logger, { level: level });
        },
        object2String: object2String
    };
};

Q.all(
    config.appenders
        .map(_ => fileutil.mkdir(path.dirname(_.filename)))
)
    .then(() => {
        log4js.configure("./bin/server/common/resources/config/log/log.json", { reloadSecs: 60 });
    });

export = {
    www: logger("www"),
    access: logger("access"),
    error: logger("error"),
    system: logger("system"),
    db: logger("db")
};
