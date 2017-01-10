import {Component, provide} from  "angular2/core";
import {Router} from  "angular2/router";

import {default as FormComponent, FORM_DIRECTIVES} from "../common/form.component";
import UserManerger from "../../manergers/user.manerger";
import NotificationManerger from "../../manergers/notification.manerger";
import UserIOModel from "../../../../common/models/io/common/user.io.model";
import Exception from "../../exceptions/exception";

@Component({
    directives: [FORM_DIRECTIVES],
    viewProviders: [
        provide(FormComponent, { useExisting: LoginComponent })
    ],
    templateUrl: "scripts/components/login/login.html"
})
class LoginComponent extends FormComponent {
    private model: UserIOModel = new UserIOModel();
    private manerger: UserManerger;
    private router: Router;

    constructor(manerger: UserManerger, router: Router) {
        super();

        this.manerger = manerger;
        this.router = router;
    }

    private ngOnInit() {
        NotificationManerger.requestPermission();
    }

    private login() {
        this.submit(() => {
            this.manerger.login(this.model)
                .subscribe(
                (model) => {
                    setTimeout(() => {
                        this.router.navigate(["Chat"]);
                    }, 0);
                },
                (error: Error) => {
                    if (!(error instanceof Exception) || (<Exception>error).hasFatal)
                        throw error;
                    else
                        this.addError(error.errors);
                }
                );
        });
    }
}

export default LoginComponent;
