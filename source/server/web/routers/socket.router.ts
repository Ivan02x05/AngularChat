import * as Q from "q";

import {Container} from "../../common/container/container";
import SocketBaseController from "../controllers/common/socket.base.controller";
import errorhandler from "../handlers/socket.error.handler";

export default function routing(socket: SocketIO.Socket) {
    return Q.fcall(() => { })
        .then(() => {
            var target = socket.nsp.name.toLowerCase().substring("/".length);
            var type: SocketBaseController = require("../controllers/socket/" + target + ".controller").default;
            var instance: SocketBaseController = Container.resolve(type, socket);
            return instance.exec()
                .finally(() => {
                    Container.remove(null, socket);
                });
        })
        .catch(error => {
            errorhandler(error, socket, model => {
                socket.emit("failure", model.data);
            });
        });
}
