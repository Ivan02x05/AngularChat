import * as Q from "q";

import {Container} from "../../common/container/container";
import SocketBaseController from "../controllers/common/socket.base.controller";
import {handleSocket} from "../handlers/domain.error.handler";

export default function routing(socket: SocketIO.Socket) {
    handleSocket(socket, () => {
        var target = socket.nsp.name.toLowerCase().substring("/".length);
        var type: SocketBaseController = require("../controllers/socket/" + target + ".controller").default;
        var instance: SocketBaseController = Container.resolve(type, socket);
        instance.exec()
            .finally(() => {
                Container.remove(null, socket);
            });
    });
}
