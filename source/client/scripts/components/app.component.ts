import {Component, OnDestroy, provide, OpaqueToken} from  "angular2/core";
import {RouteConfig, ROUTER_DIRECTIVES} from  "angular2/router";

import LoginComponent from "./login/login.component";
import ChatTopComponent from "./chat/chat.top.component";
import UserTopComponent from "./user/user.top.component";
import ApplicationErrorComponent from "./common/application.error.component";
import ApplicationErrorDirective from "../directives/application.error.directive";
import UserManerger from "../manergers/user.manerger";

@RouteConfig([
    {
        useAsDefault: true,
        path: "/login",
        name: "Login",
        component: LoginComponent,
    },
    {
        path: "/chat/...",
        name: "Chat",
        component: ChatTopComponent
    },
    {
        path: "/user",
        name: "User",
        component: UserTopComponent,
    },
    {
        path: "/error",
        name: "Error",
        component: ApplicationErrorComponent,
    }
])
@Component({
    selector: "angular-app",
    templateUrl: "scripts/components/app.html",
    directives: [ROUTER_DIRECTIVES, ApplicationErrorDirective]
})
export class AppComponent implements OnDestroy {
    private manerger: UserManerger;

    constructor(manerger: UserManerger) {
        this.manerger = manerger;
    }

    public ngOnDestroy() {
        this.manerger.clear();
    }
}
