import * as express from "express";
import {create} from "domain";

import {Container} from "../../common/container/container";
import Exception from "../../common/exceptions/exception";
import errorhandler from "./error.handler";
import {handleAndEmit} from "./socket.error.handler";

export default function handleWww(handler: (exception: Exception, req: express.Request,
    res: express.Response) => void) {

    return (req: express.Request, res: express.Response,
        next: (error?: Error) => void) => {

        const domain = create();
        domain.add(req);
        domain.add(res);
        domain.on("error", (error) => {
            errorhandler(error, req, res, (exception: Exception) => {
                handler(exception, req, res);
                Container.remove(null, req);
            });
        });
        domain.run(next);
    };
}

export function handleSocket(socket: SocketIO.Socket, next: () => void) {
    const domain = create();
    domain.add(<any>socket);
    domain.on("error", (error) => {
        handleAndEmit(error, socket);
        Container.remove(null, socket);
    });
    domain.run(next);
}
