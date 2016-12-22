import {Component, EventEmitter, Output} from  "angular2/core";
import {Router} from  "angular2/router";

import UserManerger from "../../manergers/user.manerger";
import {SystemConstant} from "../../../../common/constants/system.constant";

@Component({
    selector: "angular-header",
    template:
    `
        <div class="header">
            <div *ngIf="manerger.authenticated" class="pull-right">
                <a class="nav-link" (click)="logout();">logout</a>
                <a class="nav-link login-user" (click)="user();">{{manerger.user.fullname}}</a>
            </div>
            <h3>
                <a class="text-muted" *ngIf="manerger.authenticated" (click)="top();">{{systemname}}</a>
                <p class="text-muted" *ngIf="!manerger.authenticated">{{systemname}}</p>
            </h3>
        </div>
    `
})
class HeaderComponent {
    private manerger: UserManerger;
    private router: Router;
    private systemname = SystemConstant.SYSTEM_NAME;
    @Output()
    private onTop: EventEmitter<void> = new EventEmitter<void>();

    constructor(manerger: UserManerger, router: Router) {
        this.manerger = manerger;
        this.router = router;
    }

    private user() {
        this.router.navigate(["User"]);
    }

    private top() {
        this.router.navigate(["Chat"]);
        setTimeout(() => {
            this.onTop.emit(null);
        }, 0);
    }

    private logout() {
        this.manerger.clear()
            .subscribe(
            () => { },
            () => { },
            () => {
                this.router.navigate(["Login"]);
            }
            );
    }
}

export default HeaderComponent;
