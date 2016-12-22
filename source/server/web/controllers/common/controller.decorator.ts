import * as Q from "q";

import {Container, Cache} from "../../../common/container/container";
export {Container};
export * from "../../../common/container/inject.decorator";
import BaseController from "./base.controller";
import * as decoratorutil from "../../../common/utils/decorator.util";
import SessionManerger from "../../../common/manergers/session.manerger";
import WwwBaseController from "./www.base.controller";
import {default as SocketBaseController, ON_MESSAGE} from "./socket.base.controller";
import BaseIOModel from "../../../../common/models/io/common/base.io.model";
import BaseScaleoutModel from "../../scaleout/models/common/base.scaleout.model";
import ErrorIOModel from "../../../../common/models/io/common/error.io.model";
import BaseService from "../../../service/common/base.service";
import {getClassName} from "../../../../common/utils/class.util";
import {configValidator} from "../../validators/common.validator";
import Exception from "../../../common/exceptions/exception";

const binder = require("model-binder");
const logger = require("../../../common/utils/log.util").access;

export function controller() {
    return function <T extends BaseController>(target: { new (...args): T }): any {
        return decoratorutil.createClass({
            target: target,
            after: (instance) => {
                // regist session manerger
                Container.resolve(SessionManerger, instance, [instance.getSession()]);
            }
        });
    }
}

export function method<M extends BaseIOModel, S extends BaseService>() {
    return function <T extends WwwBaseController>(
        target: T,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<(...args) => Q.Promise<void>>)
        : TypedPropertyDescriptor<(model?: M | S) => Q.Promise<void>> {

        const original = descriptor.value;
        const types = Reflect.getMetadata("design:paramtypes", target, propertyKey);

        descriptor.value = function(...args) {
            const controller = getClassName(this);
            const method = (<any>original).name;
            const params: any[] = [];
            args.map((p) => {
                if (p)
                    params.push(p);
            });

            return Q.fcall(() => { })
                .then<any[]>(() => {
                    if (types.length == 0 || !(types[0].prototype instanceof BaseIOModel))
                        return;
                    else
                        return Q.nfcall(binder(types[0]), this.request, this.response)
                            .then(() => <M>this.request.requestModel)
                            .then(model => {
                                const errors = validate(controller, method, model);
                                if (errors == null || errors.length == 0)
                                    params.push(model);
                                else
                                    return Q.reject(new Exception(errors));
                            });
                })
                .then(() =>
                    Q.all(types
                        .filter(t => t.prototype instanceof BaseService)
                        .map(t => Q.fcall(Container.resolve, t, this, null, Cache.Prototype))
                    ).then(services => {
                        services.forEach(s => {
                            params.push(s);
                        });
                    })
                ).then(() => {
                    const model = (params.length > 0 && params[0] instanceof BaseIOModel) ? params[0] : null;
                    const loginInfo = this.session != null ? this.session.user : null;

                    logger.info("[" + controller + "][" + method + "] start\r\n" +
                        "[session:" + logger.object2String(loginInfo) + "]\r\n" +
                        "[param:" + logger.object2String(model) + "]");

                    return original.apply(this, params)
                        .finally(() => {
                            logger.info("[" + controller + "][" + method + "] end\r\n" +
                                "[session:" + logger.object2String(loginInfo) + "]\r\n" +
                                "[param:" + logger.object2String(model) + "]");
                        });
                });
        };
        return descriptor;
    };
}

export function message<M extends BaseIOModel, S extends BaseService>() {
    return function <T extends SocketBaseController>(
        target: T,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<(data?: Object) => Q.Promise<void>>)
        : TypedPropertyDescriptor<ON_MESSAGE> {

        const original = descriptor.value;
        const types = Reflect.getMetadata("design:paramtypes", target, propertyKey);

        descriptor.value = function(data?: Object) {
            const controller = getClassName(this);
            const method = (<any>original).name;

            return Q.fcall(() => { })
                .then<any[]>(() => {
                    if (data == null || types.length == 0 || !(types[0].prototype instanceof BaseIOModel))
                        return [];
                    else {
                        var model = new types[0](data);
                        var errors = validate(controller, method, model);
                        if (errors == null || errors.length == 0)
                            return [model];
                        else
                            return Q.reject(new Exception(errors));
                    }
                })
                .then(params =>
                    Q.all(types
                        .filter(t => t.prototype instanceof BaseService)
                        .map(t => Q.fcall(Container.resolve, t, this, null, Cache.Prototype))
                    ).then(services => {
                        services.forEach(s => {
                            params.push(s);
                        });
                        return params;
                    })
                ).then(params => {
                    var loginInfo = this.session != null ? this.session.user : null;
                    logger.info("[" + controller + "][" + method + "] start\r\n" +
                        "[session:" + logger.object2String(loginInfo) + "]\r\n" +
                        "[param:" + logger.object2String(data) + "]");

                    return original.apply(this, params)
                        .finally(() => {
                            params.forEach(_ => {
                                Container.remove(null, _);
                            });

                            logger.info("[" + controller + "][" + method + "] end\r\n" +
                                "[session:" + logger.object2String(loginInfo) + "]\r\n" +
                                "[param:" + logger.object2String(data) + "]");
                        });
                });
        };
        return descriptor;
    };
}

export function scaleout<M extends BaseScaleoutModel>() {
    return function <T extends SocketBaseController>(
        target: T,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<(data?: Object) => Q.Promise<void>>)
        : TypedPropertyDescriptor<(model?: M) => Q.Promise<void>> {

        const types = Reflect.getMetadata("design:paramtypes", target, propertyKey);
        const original = descriptor.value;

        descriptor.value = function(data?: Object) {
            const controller = getClassName(this);
            const method = (<any>original).name;
            const params = (data != null && types.length > 0) ? [new types[0](data)] : [];

            var loginInfo = this.session != null ? this.session.user : null;
            logger.info("[" + controller + "][" + method + "] start\r\n" +
                "[session:" + logger.object2String(loginInfo) + "]\r\n" +
                "[param:" + logger.object2String(data) + "]");

            return original.apply(this, params)
                .catch(error => this.onError(error))
                .finally(() => {
                    logger.info("[" + controller + "][" + method + "] end\r\n" +
                        "[session:" + logger.object2String(loginInfo) + "]\r\n" +
                        "[param:" + logger.object2String(data) + "]");
                });
        };
        return descriptor;
    }
}

function validate(controller: string, method: string, target: any): ErrorIOModel[] {
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
