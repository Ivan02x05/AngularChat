import {Component, OnInit} from "angular2/core";

import ErrorIOModel from "../../../../common/models/io/common/error.io.model";
import FormDirective from "../../directives/form.directive";

@Component({
    selector: "form-error",
    templateUrl: "scripts/components/common/form.error.html"
})
class FormErrorComponent implements OnInit {
    private errors: ErrorIOModel[];
    private form: FormDirective;

    constructor(form: FormDirective) {
        this.form = form;
    }

    public ngOnInit() {
        this.form.errorChanges.subscribe(
            (data) => this.onCange(data)
        );
    }

    private onCange(errors: ErrorIOModel[]) {
        this.errors = errors && errors.length > 0 ? errors : null;
    }
}

export default FormErrorComponent;
