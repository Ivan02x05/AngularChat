import * as Q from "q";
import {Subject} from "rxjs/Rx";
import {RedisClient, createClient as createRedisClient} from "redis";

var uuid = require("uuid");

import {lifecycle, LifeCycle} from "../../common/container/inject.decorator";
import BaseScaleoutModel from "./models/common/base.scaleout.model";
import {RequestScaleoutModel, RequestedScaleoutModel, ResponseScaleoutModel} from "./models/common/pubsub.scaleout.model";
import {SystemConstant} from "../../common/constants/system.constant";
import Exception from "../../common/exceptions/exception";
import {ErrorConstant} from "../../../common/constants/error.constant";
import {model} from "../../common/utils/decorator.util";

const config = require("../../common/resources/config/www/www.json");

export type Cancelable = { cancel: () => Q.Promise<void> };

@lifecycle(LifeCycle.Singleton)
export class ScaleoutClient {
    private publisher: RedisClient;
    private subscriber: RedisClient;
    private subscribers = new Map<string, Subject<BaseScaleoutModel>>();
    private providers = new Map<string, ((model?: BaseScaleoutModel) => Q.Promise<BaseScaleoutModel>)[]>();
    private requests = new Map<string, RequestedScaleoutModel>();

    public initialize() {
        this.createRedis();
        this.subscriber.on("message", this.onMessage.bind(this));
        return Q.all([
            this.subscribe(SystemConstant.Scaleout.Events.Subscribe.Common.REQUEST, this.onRequest.bind(this)),
            this.subscribe(SystemConstant.Scaleout.Events.Subscribe.Common.RESPONSE, this.onResponse.bind(this))
        ])
            .then(() => { });
    }

    private createRedis() {
        this.publisher = createRedisClient(
            config.redis.port,
            config.redis.host
        );
        this.subscriber = createRedisClient(
            config.redis.port,
            config.redis.host,
            {
                return_buffers: true
            }
        );
    }

    private onMessage(channel: Buffer, data: string) {
        var c = channel.toString();
        if (this.subscribers.has(c))
            this.subscribers.get(c).next(JSON.parse(data));
    }

    @model()
    private onRequest(model: RequestScaleoutModel) {
        Q.fcall(this.providers.has.bind(this.providers), model.channel)
            .then(flag => {
                if (!flag)
                    return [];
                else
                    return Q.all(this.providers.get(model.channel)
                        .map(_ => _(model.model))
                    );
            })
            .then(responses => {
                this.publish(SystemConstant.Scaleout.Events.Subscribe
                    .Common.RESPONSE, new ResponseScaleoutModel({
                        sender: process.pid,
                        requestId: model.requestId,
                        responses: responses
                    }));
            });
    }

    @model()
    private onResponse(model: ResponseScaleoutModel) {
        if (!this.requests.has(model.requestId))
            return;

        var request = this.requests.get(model.requestId);
        for (var r of model.responses)
            request.responses.push(r);
        request.responsed++;
        if (request.responsed == request.targets) {
            clearTimeout(request.timeout);
            this.requests.delete(request.requestId);
            request.callback.resolve(request.responses);
        }
    }

    public provide(channel: string, fn: (model?: BaseScaleoutModel) => Q.Promise<BaseScaleoutModel>): Q.Promise<Cancelable> {
        return Q.fcall(this.providers.has.bind(this.providers), channel)
            .then(flag => {
                if (flag)
                    return;

                this.providers.set(channel, []);
            })
            .then(() => {
                var providers = this.providers.get(channel);
                providers.push(fn);
                return {
                    cancel: (): Q.Promise<void> => {
                        return Q.fcall(providers.splice.bind(providers), providers.indexOf(fn), 1)
                            .then(() => {
                                if (providers.length == 0)
                                    this.providers.delete(channel);
                            });
                    }
                };
            });
    }

    public subscribe(channel: string, fn: (model?: BaseScaleoutModel) => void): Q.Promise<Cancelable> {
        return Q.fcall(this.subscribers.has.bind(this.subscribers), channel)
            .then(flag => {
                if (flag)
                    return;

                this.subscribers.set(channel, new Subject<BaseScaleoutModel>());
                return Q.nfcall<void>(this.subscriber.subscribe.bind(this.subscriber), channel);
            })
            .then(() => {
                var subject = this.subscribers.get(channel);
                var subscription = subject.subscribe(model => fn(model));
                return {
                    cancel: (): Q.Promise<void> => {
                        subscription.unsubscribe();
                        if (subject.observers.length == 0) {
                            this.subscribers.delete(channel);
                            return Q.nfcall<void>(this.subscriber.unsubscribe.bind(this.subscriber), channel);
                        }
                        return Q.fcall(() => { });
                    }
                };
            });
    }

    public publish(channel: string, model: BaseScaleoutModel) {
        this.publisher.publish(channel, JSON.stringify(model));
    }

    public get numsub(): Q.Promise<number> {
        return Q.nfcall(this.publisher.send_command.bind(this.publisher), "pubsub", ["numsub",
            SystemConstant.Scaleout.Events.Subscribe.Common.REQUEST])
            .then<number>(_ => _[1]);
    }

    public get(channel: string, model?: BaseScaleoutModel): Q.Promise<BaseScaleoutModel[]> {
        return this.numsub
            .then(numsub => {
                var request = new RequestedScaleoutModel({
                    sender: process.pid,
                    requestId: uuid.v4(),
                    channel: channel,
                    targets: numsub,
                    callback: Q.defer<BaseScaleoutModel[]>()
                });
                this.requests.set(request.requestId, request);
                request.timeout = setTimeout(() => {
                    this.requests.delete(request.requestId);
                    request.callback.reject(new Exception(ErrorConstant.Code.Fatal
                        .COMMUNICATION_TIMEOUT));
                }, config.scaleout.timeout * 1000);
                this.publish(SystemConstant.Scaleout.Events.Subscribe.Common.REQUEST,
                    new RequestScaleoutModel({
                        sender: request.sender,
                        requestId: request.requestId,
                        channel: request.channel,
                        model: model
                    }));
                return request.callback.promise;
            });
    }

    public dispose() {
        // TODO
        this.publisher.quit();
        this.subscriber.quit();
    }
}

export default ScaleoutClient;
