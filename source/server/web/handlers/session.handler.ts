/// <reference path="../../../../typings/tsd.d.ts"/>

import * as express from "express";
import {MemoryStore} from "express-session";
var Session = require("express-session").Session;

var cookie = require("cookie");
var cookieparser = require("cookie-parser");

import Exception from "../../common/exceptions/exception";
import ResponseModel from "../../../common/models/impl/common/response.model";
import UserModel from "../../../common/models/impl/common/user.model";
import {ErrorConstant} from "../../../common/constants/error.constant";
import errorhandler from "./socket.error.handler";

var config = require("../../common/resources/config/www/www.json");

export function handshake(socket: SocketIO.Socket,
    store: MemoryStore, next: (error?: { data: ResponseModel }) => void) {

    var handshake = socket.handshake;
    if (handshake.headers.cookie) {
        var parsedcookie = cookie.parse(handshake.headers.cookie);
        var sid = cookieparser.signedCookie(parsedcookie[config.session_name],
            config.session_secret_key);

        store.get(sid, (error: Error, session) => {
            if (session) {
                socket.request.sessionID = sid;
                socket.request.sessionStore = store;
                (<any>store).createSession(socket.request, session);
                decode(socket.request, null, next);
            } else
                failure(socket, next);
        });
    } else
        failure(socket, next);
}

export function decode(req: express.Request
    , res: express.Response, next: Function) {

    if (req.session && (<any>req.session).user)
        (<any>req.session).user = new UserModel((<any>req.session).user);

    next();
}

var failure = (socket: SocketIO.Socket, next: (error?: { data: ResponseModel }) => void) => {
    errorhandler(new Exception(ErrorConstant.Code.Fatal.SESSION_TIMEOUT), socket, next);
};
