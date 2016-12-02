import {Component, OnInit} from "angular2/core";

import ErrorModel from "../../../../common/models/impl/common/error.model";
import FormDirective from "../../directives/form.directive";

@Component({
    selector: "form-error",
    templateUrl: "scripts/components/common/form.error.html"
})
class FormErrorComponent implements OnInit {
    private errors: ErrorModel[];
    private form: FormDirective;

    constructor(form: FormDirective) {
        this.form = form;
    }

    public ngOnInit() {
        this.form.errorChanges.subscribe(
            (data) => this.onCange(data)
        );
    }

    private onCange(errors: ErrorModel[]) {
        this.errors = errors && errors.length > 0 ? errors : null;
    }
}

export default FormErrorComponent;
