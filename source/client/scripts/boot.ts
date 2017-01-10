import {bootstrap} from "angular2/platform/browser";
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from "angular2/router";
import {provide, Injector, ExceptionHandler as OrgExceptionHandler} from "angular2/core";
import {HTTP_PROVIDERS} from "angular2/http"
import {Observable} from "rxjs/Rx";

import {AppComponent} from "./components/app.component";
import HttpService from "./services/common/http.service";
import MessageManerger from "./manergers/message.manerger";
import DivisionManerger from "./manergers/division.manerger";
import InjectManerger from "./manergers/inject.manerger";
import UserManerger from "./manergers/user.manerger";
import NotificationManerger from "./manergers/notification.manerger";
import ExceptionHandler from "./handlers/exception.handler";
import MessageService from "./services/message.http.service";
import DivisionService from "./services/division.http.service";
import TopService from "./services/top.socket.service";
import LoginService from "./services/login.http.service";

const commonProviders =
    [
        HTTP_PROVIDERS,
        HttpService
    ];
const commonInjector = Injector.resolveAndCreate(commonProviders);
const messageInjector = commonInjector.resolveAndCreateChild([
    MessageService,
    MessageManerger
]);
const divisionInjector = commonInjector.resolveAndCreateChild([
    DivisionService,
    DivisionManerger
]);
const userInjector = commonInjector.resolveAndCreateChild([
    UserManerger,
    LoginService,
    TopService
]);

Observable
    .forkJoin([
        (<MessageManerger>messageInjector.get(MessageManerger)).initialize(),
        (<DivisionManerger>divisionInjector.get(DivisionManerger)).initialize()
    ])
    .subscribe((data) => {
        bootstrap(AppComponent, [
            ROUTER_PROVIDERS,
            commonProviders,
            NotificationManerger,
            provide(LocationStrategy, { useClass: HashLocationStrategy }),
            provide(OrgExceptionHandler, { useClass: ExceptionHandler }),
            provide(UserManerger, { useValue: userInjector.get(UserManerger) }),
            provide(MessageManerger, { useValue: data[0] }),
            provide(DivisionManerger, { useValue: data[1] })
        ]);
    });
