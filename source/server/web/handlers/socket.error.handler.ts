import * as express from "express";

import ResponseIOModel from "../../../common/models/io/common/response.io.model";
import Exception from "../../common/exceptions/exception";
import errorhandler from "./error.handler";

export default function handle(error: Error, socket: SocketIO.Socket,
    next: (error: { data: ResponseIOModel }) => void) {

    errorhandler(error, socket.request, null, (exception: Exception) => {
        next(
            {
                data: new ResponseIOModel(
                    {
                        models: null,
                        errors: exception.errors
                    }
                )
            }
        );
    });
}
