import {Injectable} from  "angular2/core";

import BaseModel from "../../../../common/models/impl/common/base.model";
import ResponseModel from "../../../../common/models/impl/common/response.model";
import ErrorModel from "../../../../common/models/impl/common/error.model";
import {ErrorConstant} from "../../../../common/constants/error.constant";
import Exception from "../../exceptions/exception";

export type ON_MESSAGE = (model?: ResponseModel) => any;
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

    protected initialize(controller: string, query: any = {}) {
        query.controller = controller;
        this.socket = io({
            path: "/framework/socket.io",
            query: query,
            forceNew: true
        });

        this.socket.on("connect", () => {
            this.onConnect();
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
        var fn = (data: any) => {
            event(new ResponseModel(data));
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
        this.on("failure", (data: ResponseModel) => {
            cb(new Exception(data.errors
                .map(_ => new ErrorModel(_.code, _.message, _.level))));
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

    protected emit(event: string, model?: BaseModel | any) {
        this.socket.emit(event, model);
    }
}

export default SocketService;
