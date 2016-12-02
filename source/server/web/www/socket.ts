/// <reference path="../../../../typings/tsd.d.ts"/>

import * as http from "http";
import {MemoryStore, SessionOptions} from "express-session";
import * as socketio from "socket.io";

import {handshake} from "../handlers/session.handler";
import router from "../routers/socket.router";
import ResponseModel from "../../../common/models/impl/common/response.model";

export default function socket(app: { server: http.Server, session: SessionOptions }) {
    var sio = socketio(app.server, { path: "/framework/socket.io" });
    sio.use((socket, next: (error?: { data: ResponseModel }) => void) => {
        handshake(socket, <MemoryStore>app.session.store, next);
    });

    sio.on("connect", (socket: SocketIO.Socket) => router(socket));

    return sio;
};
