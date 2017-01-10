import {Injector, Inject} from  "angular2/core";

class InjectManerger {
    private static _injector: Injector;

    constructor( @Inject(Injector) injector: Injector) {
        InjectManerger._injector = injector;
    }

    public get injector(): Injector {
        return InjectManerger.injector;
    }

    public static get injector(): Injector {
        return InjectManerger._injector;
    }
}

export default InjectManerger;
