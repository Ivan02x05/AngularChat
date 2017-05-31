/// <reference path="../../../typings/tsd.d.ts"/>

import * as cluster from "cluster";
import * as os from "os";
import * as Q from "q";

// import Reflect
const reflect = require("reflect-metadata/Reflect");

import MessageManerger from "../common/manergers/message.manerger";
import DivisionManerger from "../common/manergers/division.manerger";
import WwwServer from "./www/www.server";
import SocketServer from "./www/socket.server";
import ScaleoutClient from "./scaleout/client";
import {Container} from "../common/container/container";
import Exception from "../common/exceptions/exception";

const logger = require("../common/utils/log.util").error;
const config = require("../common/resources/config/www/www.json");

const create = (type) => {
    return Q.fcall(() => { })
        .then(() => Container.resolve(type).initialize());
};

if (process.env.NODE_CLUSTER == 1 && cluster.isMaster) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++)
        cluster.fork();

    cluster.on("exit", (worker, code, signal) => {
    	logger.error(`スレッド停止[pid:${worker.process.pid}][コード/シグナル:${signal || code}]。再起動開始。`);

        cluster.fork();
    });

    process.on("exit", () => {
        const workers = cluster.workers;
        for (let w in workers)
            workers[w].kill();
    });
} else {
    create(MessageManerger)
        .then(() => create(DivisionManerger))
        .then(() => create(WwwServer))
        .then(() => create(SocketServer))
        .then(() => create(ScaleoutClient))
        .then(() => Container.resolve(WwwServer).listen())
        .catch((error: Exception) => {
            logger.error(error);
        });
}
