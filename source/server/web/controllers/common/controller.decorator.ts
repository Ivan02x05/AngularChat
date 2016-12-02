/// <reference path="../../../../../typings/tsd.d.ts"/>

import * as Q from "q";

import {Container, Cache} from "../../../common/container/container";
import * as decoratorutil from "../../../common/utils/decorator.util";
import SessionManerger from "../../../common/manergers/session.manerger";
import BaseController from "./base.controller";
import WWWBaseController from "./www.base.controller";
import {default as SocketBaseController, ON_MESSAGE} from "./socket.base.controller";
import BaseModel from "../../../../common/models/impl/common/base.model";
import ErrorModel from "../../../../common/models/impl/common/error.model";
import BaseService from "../../../service/common/base.service";
import {getClassName} from "../../../../common/utils/class.util";
import {configValidator} from "../../validators/common.validator";
import Exception from "../../../common/exceptions/exception";

var binder = require("model-binder");
var logger = require("../../../common/utils/log.util").access;

export function controller<T extends BaseController>(target: { new (...args): T }): any {
    return decoratorutil.createClass({
        target: target,
        after: (instance) => {
            // regist session manerger
            Container.resolve(SessionManerger, instance, [instance.getSession()]);
        }
    });
}

export function method<M extends BaseModel, S extends BaseService>(options?:
    {
        model?: { new (...args): M },
        services?: [{ new (...args): S }]
    }) {
    return function methodDecorator<T extends WWWBaseController>(
        target: T,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<(...args) => Q.Promise<void>>)
        : TypedPropertyDescriptor<() => Q.Promise<void>> {

        const original = descriptor.value;

        descriptor.value = function() {
            const controller = getClassName(this);
            const method = (<any>original).name;

            var deferred: Q.Deferred<M> = Q.defer<M>();

            if (options && options.model) {
                var b = new binder(options.model);
                b(this.request, this.response, () => {
                    var model = <M>this.request.requestModel;
                    var errors = validate(controller, method, model);
                    if (errors == null || errors.length == 0)
                        deferred.resolve(model);
                    else
                        deferred.reject(new Exception(errors));
                });
            } else {
                deferred.resolve(null);
            }

            return deferred.promise.then((m: M) => {
                var params: any[] = [];
                if (m)
                    params.push(m);

                if (options && options.services) {
                    options.services.map((service) => {
                        params.push(Container.resolve(service, this, null, Cache.Prototype));
                    });
                }

                var loginInfo = null;
                if (this.session)
                    loginInfo = this.session.user;

                logger.info("[" + controller + "][" + method + "] start\r\n" +
                    "[session:" + logger.object2String(loginInfo) + "]\r\n" +
                    "[param:" + logger.object2String(m) + "]");

                return original.apply(this, params)
                    .finally(() => {
                        logger.info("[" + controller + "][" + method + "] end\r\n" +
                            "[session:" + logger.object2String(loginInfo) + "]\r\n" +
                            "[param:" + logger.object2String(m) + "]");
                    });
            });
        };
        return descriptor;
    }
}

function validate(controller: string, method: string, target: any): ErrorModel[] {
    controller = controller.toLowerCase();
    if (controller.indexOf("controller") > 0)
        controller = controller.replace("controller", "");

    var config = null;

    try {
        config = require("../../validators/configs/" + controller + ".validator.config.json")[method];
    } catch (error) {
        // チェックなし
    }
    if (!config)
        return null;

    return configValidator(config, target);
}

export function message<M extends BaseModel, S extends BaseService>(options?:
    {
        model?: { new (...args): M },
        services?: [{ new (...args): S }]
    }) {
    return function methodDecorator<T extends SocketBaseController>(
        target: T,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<(data: Object) => Q.Promise<void>>)
        : TypedPropertyDescriptor<ON_MESSAGE> {

        const original = descriptor.value;

        descriptor.value = function(data: Object) {
            const controller = getClassName(this);
            const method = (<any>original).name;

            var params: any[] = [];
            var services: BaseService[] = [];
            if (options) {
                if (options.model) {
                    var model = null;
                    if (data)
                        model = new options.model(data);

                    var errors = validate(controller, method, model);
                    if (errors != null && errors.length != 0)
                        return Q.reject<void>(new Exception(errors));

                    params.push(model);
                }
                if (options.services) {
                    options.services.forEach((service) => {
                        var s = Container.resolve(service, this, null, Cache.Prototype);
                        services.push(s)
                        params.push(s);
                    });
                }
            }

            var loginInfo = null;
            if (this.session)
                loginInfo = this.session.user;

            logger.info("[" + controller + "][" + method + "] start\r\n" +
                "[session:" + logger.object2String(loginInfo) + "]\r\n" +
                "[param:" + logger.object2String(data) + "]");

            return original.apply(this, params)
                .finally(() => {
                    services.forEach((_) => {
                        Container.remove(null, _);
                    });

                    logger.info("[" + controller + "][" + method + "] end\r\n" +
                        "[session:" + logger.object2String(loginInfo) + "]\r\n" +
                        "[param:" + logger.object2String(data) + "]");
                });
        };
        return descriptor;
    }
}
