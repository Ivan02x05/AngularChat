import * as Q from "q";

import {Container, LifeCycle, Cache} from "./container";
import * as decoratorutil from "../utils/decorator.util";

export {LifeCycle, Cache}

export function lifecycle(lifecycle: LifeCycle): Function {
    return function <TFunction extends Function>(target: TFunction): Function {
        (<any>target).lifecycle = lifecycle;
        return target;
    }
}

export function inject(injects: { clazz: { new (...args): any }, cache?: Cache, params?: any[], remove?: boolean }[]): Function {
    function decorator(target: { new (...args): any }, name?: string, descriptor?: TypedPropertyDescriptor<Function>):
        Function | PropertyDescriptor {

        switch (arguments.length) {
            case 1:
                return classDecorator(target);
            case 3:
                return methodDecorator(target, name, descriptor);
            default:
                break;
        }
    }

    function classDecorator(target: { new (...args): any }): Function {
        return decoratorutil.createClass({
            target: target,
            before: (instance: any, params: any[]) => {
                for (var i of injects) {
                    var inject: any = Container.resolve(i.clazz, instance, i.params, i.cache);
                    params.push(inject);
                }
            }
        });
    }

    function methodDecorator(target: { new (...args): any }, propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<Function>): TypedPropertyDescriptor<Function> {

        const original = descriptor.value;

        descriptor.value = function(...args: any[]) {
            var params: any[] = [];
            var remove: any[] = [];
            args.map((p) => {
                if (p)
                    params.push(p);
            });

            for (var i of injects) {
                var instance = Container.resolve(i.clazz, this, i.params, i.cache)
                params.push(instance);
                if (i.remove)
                    remove.push(instance);
            }

            return Q.fcall(() => { })
                .then(() => original.apply(this, params))
                .finally(() => {
                    remove.forEach(r => {
                        Container.remove(null, r);
                    });
                });
        };
        return descriptor;
    }

    return decorator;
}
