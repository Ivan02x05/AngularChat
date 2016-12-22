import {bootstrap} from "angular2/platform/browser";
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from "angular2/router";
import {provide, Provider, Injector, ComponentRef, ExceptionHandler as OrgExceptionHandler} from "angular2/core";
import {HTTP_PROVIDERS} from "angular2/http"
import * as rxjs from "rxjs/Rx";

import {AppComponent} from "./components/app.component";
import HttpService from "./services/common/http.service";
import SocketService from "./services/common/socket.service";
import MessageService from "./services/message.http.service";
import MessageManerger from "./manergers/message.manerger";
import DivisionService from "./services/division.http.service";
import DivisionManerger from "./manergers/division.manerger";
import InjectManerger from "./manergers/inject.manerger";
import ExceptionHandler from "./handlers/exception.handler";
import TopService from "./services/top.socket.service";
import UserManerger from "./manergers/user.manerger";
import NotificationManerger from "./manergers/notification.manerger";

// initialize singlton
const providers: any[] = [
    HTTP_PROVIDERS,
    provide(HttpService, { useClass: HttpService })
];

const injector = Injector.resolveAndCreate([
    providers,
    MessageService,
    MessageManerger,
    DivisionService,
    DivisionManerger,
    TopService,
    UserManerger,
    NotificationManerger
]);

rxjs.Observable
    .forkJoin([
        (<MessageManerger>injector.get(MessageManerger)).initialize(),
        (<DivisionManerger>injector.get(DivisionManerger)).initialize()
    ]).map((result) => {
        return {
            messageMgr: <MessageManerger>result[0],
            divisionMgr: <DivisionManerger>result[1]
        };
    })
    .first()
    .subscribe((data) => {
        bootstrap(AppComponent, [
            ROUTER_PROVIDERS,
            providers,
            provide(LocationStrategy, { useClass: HashLocationStrategy }),
            provide(OrgExceptionHandler, { useClass: ExceptionHandler }),
            provide(SocketService, { useClass: SocketService }),
            provide(MessageManerger, { useValue: data.messageMgr }),
            provide(DivisionManerger, { useValue: data.divisionMgr }),
            provide(UserManerger, { useValue: injector.get(UserManerger) }),
            provide(NotificationManerger, { useValue: injector.get(NotificationManerger) })
        ]).then((component: ComponentRef) => {
            InjectManerger.injector = component.injector;
        });
    });
