import {Directive, EventEmitter, OnInit} from "angular2/core";
import {Router} from  "angular2/router";

import Exception from "../exceptions/exception";

@Directive({
    selector: "application-error"
})
class ApplicationErrorDirective implements OnInit {
    public static errorChanges: EventEmitter<Exception> = new EventEmitter<Exception>();
    public static exception: Exception;

    private router: Router;

    constructor(router: Router) {
        this.router = router;
    }

    public ngOnInit() {
        ApplicationErrorDirective.errorChanges.subscribe(_ => {
            ApplicationErrorDirective.exception = _;
            this.router.navigate(["Error"]);
        });
    }
}

export default ApplicationErrorDirective;
