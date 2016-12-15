import {ErrorConstant} from "../../../common/constants/error.constant";

export enum LifeCycle {
    Singleton,
    Prototype
}

export enum Cache {
    UseCache,
    Prototype
}

export class Container {
    // Singleton Map<Type, Instance>
    private static singleton: Map<any, any> = new Map<any, any>();
    // Containers Map<Host Instance, Container Instance>
    private static containers: Map<any, Container> = new Map<any, Container>();

    // Inject Object Map<Type, Instance>
    private objects: Map<any, any[]>;
    // Parent Container
    private parent: Container;
    // Childs Container
    private childs: Container[];
    // Host Object
    private host: any;

    constructor(host: any) {
        this.objects = new Map<any, any>();
        this.childs = [];

        this.host = host;
        this.parent = host.container;

        if (this.parent) {
            this.parent.addChild(this);
        }
        Container.containers.set(host, this);
    }

    public addChild(child: Container) {
        this.childs.push(child);
    }

    public static regist(clazz: any, params?: any[]): any {
        if (Container.singleton.has(clazz)) {
            // importすると矛盾参照となる
            var Exception = require("../exceptions/exception").default;
            throw new Exception(ErrorConstant.Code.Fatal.INSTANCE_DUPLICATE);
        }

        var obj: any = Object.create(clazz.prototype);
        clazz.apply(obj, params);
        Container.singleton.set(clazz, obj);
        return obj;
    }

    public regist(clazz: any, params?: any[]): any {
        // non check duplicate
        var obj: any = Object.create(clazz.prototype);
        obj.container = this;
        clazz.apply(obj, params);
        this.objects.set(clazz, obj);
        return obj;
    }

    public static registInstance(clazz: any): any {
        if (Container.singleton.has(clazz.constructor)) {
            // importすると矛盾参照となる
            var Exception = require("../exceptions/exception").default;
            throw new Exception(ErrorConstant.Code.Fatal.INSTANCE_DUPLICATE);
        }
        Container.singleton.set(clazz.constructor, clazz);
        return clazz;
    }

    public registInstance(clazz: any): any {
        clazz.container = this;
        this.objects.set(clazz.constructor, clazz);
        return clazz;
    }

    public static remove(clazz?: any, host?: any) {
        if (!host) {
            if (clazz && LifeCycle.Singleton == <LifeCycle>clazz.lifecycle) {
                Container.delete(Container.singleton, clazz);
            }
        } else {
            if (Container.containers.has(host)) {
                Container.containers.get(host).remove(clazz);
            }
        }
    }

    public remove(clazz?: any) {
        if (clazz) {
            // only object
            Container.delete(this.objects, clazz);
        } else {
            // delete childs
            this.childs.forEach((c: Container) => {
                c.remove();
            });
            this.childs = [];

            // delete self
            this.objects.forEach((v, k, m) => {
                Container.delete(m, k);
            });
            Container.delete(Container.containers, this.host);
        }
    }

    private static delete(target: Map<any, any>, key: any) {
        if (target.has(key)) {
            var obj = target.get(key);
            if (obj.dispose)
                obj.dispose();
            obj = null;
            target.delete(key);
        }
    }

    public static exists(clazz: any, host?: any): boolean {
        if (LifeCycle.Singleton == <LifeCycle>clazz.lifecycle)
            return Container.singleton.has(clazz);
        else if (host == null)
            return false;
        else if (!Container.containers.has(host))
            return false;
        else return Container.containers.get(host).exists(clazz);
    }

    public exists(clazz: any): boolean {
        if (LifeCycle.Singleton == <LifeCycle>clazz.lifecycle)
            return Container.singleton.has(clazz);
        else if (this.objects.has(clazz))
            return true;
        else if (this.host instanceof clazz)
            return true;
        else if (this.parent != null)
            return this.parent.exists(clazz);
        else
            return false;
    }

    public static resolve(clazz: any, host?: any, params?: any[], cache?: Cache): any {
        if (LifeCycle.Singleton == <LifeCycle>clazz.lifecycle) {
            // singleton
            if (!Container.singleton.has(clazz))
                return Container.regist(clazz, params);

            return Container.singleton.get(clazz);
        } else {
            if (host == null) {
                if (cache == Cache.UseCache) {
                    if (Container.singleton.has(clazz))
                        return Container.singleton.get(clazz);
                    else
                        return null;
                }
                else
                    return null;
            }

            var container: Container;
            if (Container.containers.has(host))
                container = Container.containers.get(host);
            else
                container = new Container(host);

            return container.resolve(clazz, params, cache);
        }
    }

    public resolve(clazz: any, params?: any[], cache?: Cache, regist = true): any {
        if (LifeCycle.Singleton == <LifeCycle>clazz.lifecycle) {
            // singleton
            if (!Container.singleton.has(clazz))
                return Container.regist(clazz, params);

            return Container.singleton.get(clazz);
        } else if (cache == Cache.Prototype || LifeCycle.Prototype == <LifeCycle>clazz.lifecycle) {
            // non cache
            return this.regist(clazz, params);
        } else {
            // else
            if (this.objects.has(clazz)) {
                return this.objects.get(clazz);
            } else if (this.host instanceof clazz) {
                return this.host;
            } else {
                if (this.parent) {
                    var obj: any = this.parent.resolve(clazz, null, null, false);
                    if (obj) {
                        return obj;
                    }
                }

                if (!regist)
                    // parentより実行されるため、判定が必要
                    return null;

                return this.regist(clazz, params);
            }
        }
    }
}

export default Container;
