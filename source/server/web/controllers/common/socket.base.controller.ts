import * as Q from "q";

export * from "./base.controller";
import {BaseController, scaleout, Container} from "./base.controller";
import BaseIOModel from "../../../../common/models/io/common/base.io.model";
import BaseScaleoutModel from "../../scaleout/models/common/base.scaleout.model";
import UserScaleoutModel from "../../scaleout/models/common/user.scaleout.model";
import UserIOModel from "../../../../common/models/io/common/user.io.model";
import SessionIOModel from "../../../../common/models/io/common/session.io.model";
import ServiceResult from "../../../service/common/service.result";
import BaseServide from "../../../service/common/base.service";
import ResponseIOModel from "../../../../common/models/io/common/response.io.model";
import {handleAndEmit} from "../../handlers/socket.error.handler";
import authhandler from "../../handlers/auth.handler";
import {decode as sessiondecoder} from "../../handlers/session.handler";
import {inject} from "../../../common/container/inject.decorator";
import SessionManerger from "../../../common/manergers/session.manerger";
import {ScaleoutClient, Cancelable} from "../../scaleout/client";
import {SystemConstant} from "../../../common/constants/system.constant";

const socketio = require("socket.io/lib/socket");

export type ON_MESSAGE = <M extends BaseIOModel, S extends BaseServide>
(model?: M, ...services: S[]) => Q.Promise<void>;

export type ON_MESSAGE_MAP = { [key: string]: ON_MESSAGE };

const config = require("../../../common/resources/config/www/www.json");

@inject([{ clazz: socketio }, { clazz: ScaleoutClient }])
export abstract class SocketBaseController extends BaseController {
    private sessionUpdateInterval: number;
    private unsubscribers = new Map<string, Cancelable>();
    private unproviders = new Map<string, Cancelable>();
    private deferred = Q.defer<void>();
    protected socket: SocketIO.Socket;
    protected scaleout: ScaleoutClient;

    public get session(): SessionIOModel {
        return this.getSession();
    }

    public getSession(): SessionIOModel {
        return <SessionIOModel>this.socket.request.session;
    }

    constructor(socket?: SocketIO.Socket, scaleout?: ScaleoutClient) {

        super();

        this.socket = socket;
        this.scaleout = scaleout;
    }

    public exec(): Q.Promise<void> {
        return this.onConnect()
            .then(() => this.deferred.promise);
    }

    protected onError(error: Error) {
        handleAndEmit(error, this.socket);
    }

    protected onConnect(): Q.Promise<void> {
        this.socket.on("disconnect", () => { this.onDisconnect(); });

        return Q.fcall(this.initialize.bind(this))
            .then(events => {
                const register = (e: string) => {
                    this.socket.on(e, (json: BaseIOModel) => {
                        this.onMessage(events[e], json);
                    });
                };
                for (var event in events)
                    register(event);
            })
            .then(() => this.subscribe(SystemConstant.Scaleout.Events.Subscribe.Common
                .SESSION_CHANGE, (model: UserScaleoutModel) => {
                    if (this.session && this.session.user && this.session.user._id == model.user._id)
                        this.onSessionChangeSubscribe(model);
                }
            ))
            .then(() => {
                // セッションを維持する
                this.sessionUpdateInterval = setInterval(() => {
                    this.reloadSession();
                }, 1000 * config.interval.updateSession);
            });
    }

    @scaleout()
    protected onSessionChangeSubscribe(model: UserScaleoutModel): Q.Promise<void> {
        return this.reloadSession();
    }

    protected reloadSession(): Q.Promise<void> {
        if (this.session == null)
            return this.onSessionTimeout();

        return Q.nfcall(this.session.reload.bind(this.session))
            .then(() => Q.nfcall(sessiondecoder, this.socket.request, null))
            .then(() => Q.nfcall(this.session.touch().save.bind(this.session)))
            .then(() => Q.nfcall(this.socket.request.sessionStore.touch.bind(this.socket.request.sessionStore), this.session.id, this.session))
            .then(() => { Container.resolve(SessionManerger, this).session = this.session; })
            .catch(error => this.onSessionTimeout());
    }

    protected onSessionTimeout(): Q.Promise<void> {
        const close = () => {
            return Q.nfcall<Error>(authhandler, this.socket.request, null)
                .then(error => this.onError(error))
                .then(() => this.onDisconnect())
                .then(() => {
                    this.socket.disconnect(true);
                });
        };

        if (this.session == null)
            return close();
        else
            return Q.nfcall(this.session.destroy.bind(this.session))
                .then(() => close());
    }

    protected onMessage(message: ON_MESSAGE, json?: BaseIOModel) {
        Q.nfcall(authhandler, this.socket.request, null)
            .then(() => message.bind(this)(json))
            .catch((error: Error) => this.onError(error));
    }

    protected onDisconnect() {
        clearInterval(this.sessionUpdateInterval);
        this.socket.leaveAll();
        return this.unsubscribeAll()
            .then(() => this.unprovideAll())
            .then(this.deferred.resolve);
    }

    protected emit(event: string, result?: ServiceResult | ResponseIOModel, fromself: boolean = true) {
        var model: ResponseIOModel;
        if (result != null)
            if (result instanceof ServiceResult)
                model = SocketBaseController.resultToIOModel(<ServiceResult>result);
            else
                model = <ResponseIOModel>result;
        else
            model = new ResponseIOModel({ models: {}, errors: null });

        model.models.fromself = fromself;

        this.socket.emit(event, model);
    }

    protected publish(channel: string, model: BaseScaleoutModel) {
        model.sender = this.socket.id;
        this.scaleout.publish(channel, model);
    }

    protected subscribe(channel: string, fn: (model: BaseScaleoutModel) => void): Q.Promise<void> {
        return this.unsubscribe(channel)
            .then(() => this.scaleout.subscribe(channel, fn.bind(this)))
            .then(unsubscriber => {
                this.unsubscribers.set(channel, unsubscriber);
            });
    }

    protected unsubscribeAll(): Q.Promise<void> {
        const unsubscribers = [];
        this.unsubscribers.forEach((v, k) => {
            unsubscribers.push(k);
        });
        return Q.all(unsubscribers.map(_ => this.unsubscribe(_)))
            .then(() => { });
    }

    protected unsubscribe(channel: string): Q.Promise<void> {
        return Q.fcall(this.unsubscribers.has.bind(this.unsubscribers), channel)
            .then(flag => {
                if (!flag)
                    return;

                const unsubscriber = this.unsubscribers.get(channel);
                this.unsubscribers.delete(channel);
                return unsubscriber.cancel();
            });
    }

    protected provide(channel: string, fn: (model?: BaseScaleoutModel) => Q.Promise<BaseScaleoutModel>): Q.Promise<void> {
        return this.scaleout.provide(channel, fn.bind(this))
            .then(unprovider => {
                this.unproviders.set(channel, unprovider);
            });
    }

    protected unprovide(channel: string): Q.Promise<void> {
        return Q.fcall(this.unproviders.has.bind(this.unproviders), channel)
            .then(flag => {
                if (!flag)
                    return;

                const unprovider = this.unproviders.get(channel);
                this.unproviders.delete(channel);
                return unprovider.cancel();
            });
    }

    protected unprovideAll(): Q.Promise<void> {
        const unproviders = [];
        this.unproviders.forEach((v, k) => {
            unproviders.push(k);
        });
        return Q.all(unproviders.map(_ => this.unprovide(_)))
            .then(() => { });
    }

    protected abstract initialize(): ON_MESSAGE_MAP;
}

export default SocketBaseController;
