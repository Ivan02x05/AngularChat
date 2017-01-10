import {NgControlName} from "angular2/common";
import {Component, Input, OnInit, Optional} from "angular2/core";

import {ValidatorResult} from "../../validators/validator.common";
import FormGroupDirective from "../../directives/form-group.directive";
import ErrorIOModel from "../../../../common/models/io/common/error.io.model";

@Component({
    selector: "control-error",
    templateUrl: "scripts/components/common/control.error.html"
})
class ControlErrorComponent implements OnInit {
    @Input("target") private control: NgControlName;
    private error: ErrorIOModel;
    private formGroup: FormGroupDirective;

    constructor( @Optional() formGroup: FormGroupDirective) {
        this.formGroup = formGroup;
    }

    public ngOnInit() {
        // コントロールオブジェクトが作成されるよう、イベントで処理する。
        setTimeout(() => { this.init(); }, 0);
    }

    private init() {
        this.control.control.valueChanges.subscribe(
            (data) => this.onCange(data)
        );
    }

    private onCange(value: any) {
        if (this.formGroup)
            this.formGroup.valid = this.control.valid;

        if (this.control.errors) {
            const errors = <ValidatorResult>this.control.errors;
            const key = Object.keys(errors)[0];
            this.error = errors[key];
        } else
            this.error = null;
    }
}

export default ControlErrorComponent;
