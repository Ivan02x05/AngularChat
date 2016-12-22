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
                for (let i of injects) {
                    const inject: any = Container.resolve(i.clazz, instance, i.params, i.cache);
                    params.push(inject);
                }
            }
        });
    }

    function methodDecorator(target: { new (...args): any }, propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<Function>): TypedPropertyDescriptor<Function> {

        const original = descriptor.value;

        descriptor.value = function(...args: any[]) {
            const params: any[] = [];
            const remove: any[] = [];
            args.map((p) => {
                if (p)
                    params.push(p);
            });

            for (let i of injects) {
                const inject = Container.resolve(i.clazz, this, i.params, i.cache)
                params.push(inject);
                if (i.remove)
                    remove.push(inject);
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
