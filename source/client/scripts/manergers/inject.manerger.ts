import {Injector} from  "angular2/core";

class InjectManerger {
    private static _injector: Injector;

    public static get injector(): Injector {
        return InjectManerger._injector;
    }

    public static set injector(injector: Injector) {
        InjectManerger._injector = injector;
    }
}

export default InjectManerger;
