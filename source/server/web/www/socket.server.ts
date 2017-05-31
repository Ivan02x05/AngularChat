import * as socketio from "socket.io";
import * as path from "path";

const adapter = require("socket.io-redis");

import {inject, lifecycle, LifeCycle} from "../../common/container/inject.decorator";
import {handshake} from "../handlers/session.handler";
import router from "../routers/socket.router";
import ResponseIOModel from "../../../common/models/io/common/response.io.model";
import * as fileutil from "../../common/utils/file.util";
import WwwServer from "./www.server";

const config = require("../../common/resources/config/www/www.json");

@lifecycle(LifeCycle.Singleton)
class SocketServer {
    public server: SocketIO.Server;

    public initialize() {
        this.createServer();
    }

    @inject([{ clazz: WwwServer }])
    private createServer(www?: WwwServer) {
        this.server = socketio(www.server, { path: "/framework/socket.io" });
        this.server.adapter(adapter({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password
        }));
        this.server.use((socket: SocketIO.Socket, next: (error?: { data: ResponseIOModel }) => void) => {
            handshake(socket, www.store, next);
        });
        fileutil.readdirSync(path.join(__dirname, "../controllers/socket"))
            .map(_ => _.split(".")[0])
            .forEach(_ => {
                this.server.of("/" + _)
                    .on("connect", router);
            });
    }
}
export default SocketServer;
