/// <reference path="../../../../../typings/tsd.d.ts"/>

import * as Q from "q";
import {Subject, Subscription} from "rxjs/Rx";

import BaseController from "./base.controller";
import BaseModel from "../../../../common/models/impl/common/base.model";
import UserModel from "../../../../common/models/impl/common/user.model";
import SessionModel from "../../../../common/models/impl/common/session.model";
import ServiceResult from "../../../service/common/service.result";
import BaseServide from "../../../service/common/base.service";
import ResponseModel from "../../../../common/models/impl/common/response.model";
import errorhandler from "../../handlers/socket.error.handler";
import authhandler from "../../handlers/auth.handler";
import {decode as sessiondecoder} from "../../handlers/session.handler";
import {Container} from "../../../common/container/container";
import SessionManerger from "../../../common/manergers/session.manerger";

export type ON_MESSAGE = <M extends BaseModel | any, S extends BaseServide>
(model?: M, ...services: S[]) => Q.Promise<void>;

export type ON_MESSAGE_MAP = { [key: string]: ON_MESSAGE };

var config = require("../../../common/resources/config/www/www.json");

abstract class SocketBaseController extends BaseController {
    public static onChangedSessionSubject: Subject<UserModel> = new Subject<UserModel>();
    private onChangedSessionSubscription: Subscription;

    private sessionUpdateInterval: number;

    protected socket: SocketIO.Socket;
    protected deferred = Q.defer<void>();

    public get session(): SessionModel {
        return this.getSession();
    }

    public set session(session: SessionModel) {
        (<any>this.socket.request).session = session;
    }

    public getSession(): SessionModel {
        return <SessionModel>(<any>this.socket.request).session;
    }

    constructor(socket: SocketIO.Socket) {
        super();

        this.socket = socket;
    }

    public exec(): Q.Promise<any> {
        return this.deferred.promise;
    }

    public init(): Q.Promise<void> {
        this.onConnect();
        this.socket.on("disconnect", () => { this.onDisconnect(); });

        this.onChangedSessionSubscription = SocketBaseController.onChangedSessionSubject
            .subscribe(_ => {
                if (this.session != null && this.session.user != null && _._id == this.session.user._id)
                    this.onChangedSession();
            });
        return Q.resolve<void>(null);
    }

    protected onChangedSession(): Q.Promise<void> {
        return this.updateSession();
    }

    protected onError(error: Error) {
        errorhandler(error, this.socket, ((model) => {
            this.socket.emit("failure", model.data);
        }));
    }

    protected onConnect() {
        var events = this.initialize();
        for (var event in events) {
            var register = (e: string) => {
                this.socket.on(e, (json: BaseModel) => {
                    this.onMessage(events[e], json);
                });
            };

            register(event);
        }

        // セッションを維持する
        this.sessionUpdateInterval = setInterval(() => {
            this.updateSession();
        }, 1000 * config.interval.updateSession);
    }

    protected updateSession(): Q.Promise<void> {
        if (this.session == null)
            return this.onSessionTimeout();

        var deferred: Q.Deferred<void> = Q.defer<void>();
        (<any>this.session).reload((error: Error) => {
            // create object from json
            if (!error)
                sessiondecoder(this.socket.request, null, () => {
                    (<any>this.session).touch().save();
                    var manerger = <SessionManerger>Container
                        .resolve(SessionManerger, this);
                    manerger.session = this.session;

                    deferred.resolve();
                });
            else
                this.onSessionTimeout()
                    .then(() => deferred.resolve());
        });
        return deferred.promise;
    }

    protected onSessionTimeout(): Q.Promise<void> {
        var deferred: Q.Deferred<void> = Q.defer<void>();
        var close = () => {
            authhandler(this.socket.request, null, this.onError.bind(this));
            this.socket.disconnect(true);
            deferred.resolve();
        };

        if (this.session == null)
            close();
        else
        (<any>this.session).destroy(() => {
                close();
            });
        return deferred.promise;
    }

    protected onMessage(message: ON_MESSAGE, json?: BaseModel) {
        Q.fcall(() => {
            var deferred: Q.Deferred<void> = Q.defer<void>();
            authhandler(this.socket.request, null, (error?: Error) => {
                if (error)
                    deferred.reject(error);
                else
                    deferred.resolve(message.bind(this)(json));
            });
            return deferred.promise;
        }).catch((error: Error) => this.onError(error));
    }

    protected onDisconnect() {
        clearInterval(this.sessionUpdateInterval);
        this.onChangedSessionSubscription.unsubscribe();
        this.deferred.resolve();
    }

    public emit(event: string, result?: ServiceResult | ResponseModel, fromself: boolean = true) {
        var model: ResponseModel;
        if (result)
            if (result instanceof ServiceResult)
                model = this.resultToModel(<ServiceResult>result);
            else
                model = <ResponseModel>result;
        else
            model = new ResponseModel({ models: {}, errors: null });

        model.models.fromself = fromself;

        this.socket.emit(event, model);
    }

    public emits(target: SocketBaseController | SocketBaseController[], event: string,
        result?: ServiceResult | ResponseModel) {

        if (Array.isArray(target))
            target.forEach(_ => {
                _.emit(event, result, this == _);
            });
        else
            target.emit(event, result, this == target);
    }

    protected abstract initialize(): ON_MESSAGE_MAP;
}

export default SocketBaseController;
