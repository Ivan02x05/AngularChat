import * as Q from "q";

import {Container, Cache} from "../../common/container/container";
import * as decoratorutil from "../../common/utils/decorator.util";
import BaseServide from "./base.service";
import ServideResult from "./service.result";
import DataBase from "../../database/database";

export function service<T extends BaseServide>(target: { new (...args): T }): any {
    return decoratorutil.createClass({
        target: target,
        after: (instance) => {
            // service:database = 1:1
            Container.resolve(DataBase, instance);
        }
    });
}

export function method() {
    return function <T extends BaseServide>(
        target: T,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<(...args) => Q.Promise<any>>)
        : TypedPropertyDescriptor<(...args) => Q.Promise<ServideResult>> {

        const original = descriptor.value;

        descriptor.value = function(...args: any[]) {
            // regist service result
            const result: ServideResult = Container.resolve(ServideResult, this, null, Cache.Prototype);
            return original.apply(this, args)
                .then(() => result);
        };
        return descriptor;
    }
}
