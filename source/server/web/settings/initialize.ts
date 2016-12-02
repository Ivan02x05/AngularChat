/// <reference path="../../../../typings/tsd.d.ts"/>

import * as Q from "q";

import MessageManerger from "../../common/manergers/message.manerger";
import DivisionManerger from "../../common/manergers/division.manerger";

const TARGET: [() => Q.Promise<void>] =
    [
        MessageManerger.initialize,
        DivisionManerger.initialize
    ];

export default function initialize(): Q.Promise<void> {
    return Q.all(TARGET.map((f) => {
        return f();
    })).then(() => Q.resolve<void>(null));
}
