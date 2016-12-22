export function model<M>() {
    return function(
        target: any,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<(...args) => any>)
        : TypedPropertyDescriptor<(model: M, ...args) => any> {

        const original = descriptor.value;
        const types = Reflect.getMetadata("design:paramtypes", target, propertyKey);

        descriptor.value = function(...args) {
            const params = [];
            for (let i = 0, length = args.length; i < length; i++) {
                if (i == 0 && types.length > 0)
                    params.push(new types[0](args[i]));
                else
                    params.push(args[i]);
            }
            return original.apply(this, params);
        };
        return descriptor;
    };
}

export function createClass<T>(
    options: {
        target: { new (...args): T },
        before?: (instance: T, params: any[]) => void,
        after?: (instance: T) => void
    }): Function {
    const constructor = function(...args) {
        const params: any[] = [];
        args.forEach((p) => {
            if (p)
                params.push(p);
        });

        if (options.before)
            options.before(this, params);

        options.target.apply(this, params);

        if (options.after)
            options.after(this);
    }

    // all fields copy
    let t: any = options.target;
    let c: any = constructor;
    while (t && t.prototype && typeof (t) == "function") {
        for (let prop in t)
            c[prop] = t[prop];
        for (let mthd of Object.getOwnPropertyNames(t)) {
            if (typeof (t[mthd]) == "function")
                c[mthd] = t[mthd];
        }
        t = t.__proto__;
    }

    constructor.prototype = Object.create(options.target.prototype);
    constructor.prototype.constructor = options.target;

    return constructor;
}
