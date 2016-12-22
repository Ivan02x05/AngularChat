const log4js = require('log4js');
import {inspect} from "util";

import Exception from "../exceptions/exception";

log4js.configure('./bin/server/common/resources/config/log/log.json', { reloadSecs: 60 });

const logger = (logger) => {
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
        object2String: object2String
    }
}

export = {
    www: log4js.connectLogger(log4js.getLogger("www"), { level: log4js.levels.INFO }),
    access: logger(log4js.getLogger("access")),
    error: logger(log4js.getLogger("error")),
    system: logger(log4js.getLogger("system")),
    db: logger(log4js.getLogger("db")),
    levels: log4js.levels
}
