/// <reference path="../../../../typings/tsd.d.ts"/>

import * as Q from "q";

import {Container} from "../../common/container/container";
import SocketBaseController from "../controllers/common/socket.base.controller";

export default function routing(socket: SocketIO.Socket) {

    return Q.resolve<void>(null)
        .then(() => {
            var target = (<string>socket.handshake.query.controller).toLowerCase();
            var type: SocketBaseController = require("../controllers/socket/" + target + ".controller").default;
            var instance: SocketBaseController = Container.resolve(type, socket, [socket]);
            return instance.init()
                .then(() => instance.exec());
        })
        .finally(() => {
            Container.remove(null, socket);
        });
}
