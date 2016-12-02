import {Component, EventEmitter} from "angular2/core";

import ApplicationErrorDirective from "../../directives/application.error.directive";
import Exception from "../../exceptions/exception";
import HeaderComponent from "./header.component";

@Component({
    template:
    `
        <angular-header></angular-header>
        <div class="main">
            <strong>Error!</strong>
            <br>
            {{exception.message}}
        </div>
    `,
    directives: [HeaderComponent]
})
class ApplicationErrorComponent {
    private exception: Exception;

    constructor() {
        this.exception = ApplicationErrorDirective.exception;
        ApplicationErrorDirective.exception = null;
    }
}

export default ApplicationErrorComponent;
