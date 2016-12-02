/// <reference path="../../../../typings/tsd.d.ts"/>

import * as express from "express";

import ResponseModel from "../../../common/models/impl/common/response.model";
import Exception from "../../common/exceptions/exception";
import errorhandler from "./error.handler";

export default function handle(error: Error, socket: SocketIO.Socket,
    next: (error: { data: ResponseModel }) => void) {

    errorhandler(error, socket.request, null, (exception: Exception) => {
        next(
            {
                data: new ResponseModel(
                    {
                        models: null,
                        errors: exception.errors
                    }
                )
            }
        );
    });
}
