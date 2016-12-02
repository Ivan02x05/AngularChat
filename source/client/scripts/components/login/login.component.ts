import {Component, provide} from  "angular2/core";
import {Router} from  "angular2/router";

import {default as FormComponent, FORM_DIRECTIVES} from "../common/form.component";
import LoginService from "../../services/login.http.service";
import UserManerger from "../../manergers/user.manerger";
import NotificationManerger from "../../manergers/notification.manerger";
import UserModel from "../../../../common/models/impl/common/user.model";
import {ErrorConstant} from "../../../../common/constants/error.constant";
import {AppComponent} from "../app.component";

@Component({
    directives: [FORM_DIRECTIVES],
    providers: [LoginService],
    viewProviders: [
        provide(FormComponent, { useExisting: LoginComponent })
    ],
    templateUrl: "scripts/components/login/login.html"
})
class LoginComponent extends FormComponent {
    private model: UserModel = new UserModel();
    private service: LoginService;
    private router: Router;
    private manerger: UserManerger;

    constructor(service: LoginService, router: Router, manerger: UserManerger) {
        super();

        this.service = service;
        this.router = router;
        this.manerger = manerger;
    }

    private ngOnInit() {
        NotificationManerger.requestPermission();
    }

    private login() {
        this.clearError();

        this.service.login(this.model)
            .subscribe((model) => {
                if (model.hasError)
                    this.addError(model.errors);
                else if (!model.models.user)
                    this.addError(ErrorConstant.Code.Error.FAILURE_LOGIN);
                else {
                    this.manerger.initialize(
                        new UserModel(model.models.user));

                    this.router.navigate(["Chat"]);
                }
            });
    }
}

export default LoginComponent;
