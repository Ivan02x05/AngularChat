import * as express from "express";
import {Store} from "express-session";

const cookie = require("cookie");
const cookieparser = require("cookie-parser");

import Exception from "../../common/exceptions/exception";
import ResponseIOModel from "../../../common/models/io/common/response.io.model";
import UserIOModel from "../../../common/models/io/common/user.io.model";
import ChatViewedNoIOModel from "../../../common/models/io/chat/chat.viewedno.io.model";
import {ErrorConstant} from "../../../common/constants/error.constant";
import errorhandler from "./socket.error.handler";

const config = require("../../common/resources/config/www/www.json");

export function handshake(socket: SocketIO.Socket,
    store: Store, next: (error?: { data: ResponseIOModel }) => void) {

    const fault = () => {
        errorhandler(new Exception(ErrorConstant.Code.Fatal.SESSION_TIMEOUT), socket, next);
    };

    const handshake = socket.handshake;
    if (handshake.headers.cookie) {
        const parsedcookie = cookie.parse(handshake.headers.cookie);
        const sid = cookieparser.signedCookie(parsedcookie[config.session_name],
            config.session_secret_key);

        (<any>store).get(sid, (error: Error, session) => {
            if (session) {
                socket.request.sessionID = sid;
                socket.request.sessionStore = store;
                (<any>store).createSession(socket.request, session);
                decode(socket.request, null, next);
            } else
                fault();
        });
    } else
        fault();
}

export function decode(req: express.Request
    , res: express.Response, next: Function) {

    if (req.session) {
        if ((<any>req.session).user)
            (<any>req.session).user = new UserIOModel((<any>req.session).user);
        if ((<any>req.session).chatViewedNo)
            (<any>req.session).chatViewedNo = new ChatViewedNoIOModel((<any>req.session).chatViewedNo);
    }

    next();
}
