import {Container, LifeCycle, Cache} from "./container";
import * as decoratorutil from "../utils/decorator.util";

export {LifeCycle, Cache}

export function lifecycle(lifecycle: LifeCycle): Function {
    function decorator<TFunction extends Function>(target: TFunction): Function {
        (<any>target).lifecycle = lifecycle;
        return target;
    }

    return decorator;
}

export function inject<T extends {}>(injects: { clazz: { new (...args): T }, cache?: Cache, params?: any[] }[]): Function {
    function decorator(target: { new (...args): T }, name?: string, descriptor?: TypedPropertyDescriptor<Function>): Function | PropertyDescriptor {
        switch (arguments.length) {
            case 1:
                return classDecorator(target);
            case 3:
                return methodDecorator(target, name, descriptor);
            default:
                break;
        }
    }

    function classDecorator<T extends {}>(target: { new (...args): T }): Function {
        return decoratorutil.createClass({
            target: target,
            before: (instance: T, params: any[]) => {
                for (var i of injects) {
                    var inject: any = Container.resolve(i.clazz, instance, i.params, i.cache);
                    params.push(inject);
                }
            }
        });
    }

    function methodDecorator(target: { new (...args): T }, propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<Function>): TypedPropertyDescriptor<Function> {

        const original = descriptor.value;

        descriptor.value = function(...args: any[]) {
            var params: any[] = [];
            args.map((p) => {
                if (p)
                    params.push(p);
            });

            for (var i of injects)
                params.push(Container.resolve(i.clazz, this, i.params, i.cache));

            return original.apply(this, params);
        };
        return descriptor;
    }

    return decorator;
}
