import {Injectable} from  "angular2/core";

import BaseIOModel from "../../../../common/models/io/common/base.io.model";
import ResponseIOModel from "../../../../common/models/io/common/response.io.model";
import ErrorIOModel from "../../../../common/models/io/common/error.io.model";
import {ErrorConstant} from "../../../../common/constants/error.constant";
import Exception from "../../exceptions/exception";

export type ON_MESSAGE = (model?: ResponseIOModel) => any;
export type ON_MESSAGE_MAP = { [key: string]: ON_MESSAGE };

@Injectable()
class SocketService {
    private socket: SocketIOClient.Socket;
    private eventsMap: Map<string, Map<Function, Function>> =
    new Map<string, Map<Function, Function>>();

    private addEventsMap(message: string, fn: Function, cb: Function) {
        if (!this.eventsMap.has(message))
            this.eventsMap.set(message, new Map<Function, Function>());

        this.eventsMap.get(message).set(fn, cb);
    }

    protected initialize(controller: string) {
        this.socket = io("ws://" + location.host + "/" + controller, {
            path: "/framework/socket.io/",
            forceNew: true,
            transports: ["websocket"]
        });

        this.socket.on("connect", () => {
            this.onConnect();
        });
        this.socket.on("error", (error: Error) => {
            this.onError(error);
        });
        this.socket.on("connect_error", (error: Error) => {
            this.onError(error);
        });
        this.onFailure = (error: Exception) => {
            if (this.socket.listeners("failure").length == 1
                || error.level > ErrorConstant.ErrorLevel.Error) {
                this.onError(error);
                return false;
            }
        };
    }

    public on(message: string, event: ON_MESSAGE, link?: Function) {
        const fn = (data: any) => {
            event(new ResponseIOModel(data));
        };

        if (link) {
            this.addEventsMap(message, link, fn)
        }

        this.socket.on(message, fn);
    }

    public off(message: string | Function, fn?: Function) {
        if (message instanceof Function) {
            fn = <Function>message;
            this.eventsMap.forEach((v, k) => {
                if (v.has(fn)) {
                    message = k;
                    fn = v.get(fn);
                }
            });

            if (message instanceof Function)
                return;
        } else if (fn) {
            if (this.eventsMap.has(message)) {
                if (this.eventsMap.get(message).has(fn)) {
                    fn = this.eventsMap.get(message).get(fn);
                }
            }
        }

        this.socket.off(<string>message, fn);
    }

    public set onFailure(cb: (error: Exception) => void) {
        this.on("failure", (data: ResponseIOModel) => {
            cb(new Exception(data.errors
                .map(_ => new ErrorIOModel(_.code, _.message, _.level))));
        }, cb);
    }

    public close() {
        this.socket.close();
    }

    public open() {
        this.socket.open();
    }

    protected onConnect() {

    }

    protected onError(error: Error) {
        throw error;
    }

    protected emit(event: string, model?: BaseIOModel) {
        this.socket.emit(event, model);
    }
}

export default SocketService;
