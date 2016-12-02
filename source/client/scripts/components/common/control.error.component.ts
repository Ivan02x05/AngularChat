import {NgControlName} from "angular2/common";
import {Component, Input, OnInit, OptionalMetadata} from "angular2/core";

import {ValidatorResult} from "../../validators/validator.common";
import FormGroupDirective from "../../directives/form-group.directive";
import ErrorModel from "../../../../common/models/impl/common/error.model";

@Component({
    selector: "control-error",
    templateUrl: "scripts/components/common/control.error.html"
})
@(<any>Reflect).metadata("parameters", [[new OptionalMetadata()]])
class ControlErrorComponent implements OnInit {
    @Input("target") private control: NgControlName;
    private error: ErrorModel;
    private formGroup: FormGroupDirective;

    constructor(formGroup: FormGroupDirective) {
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
            var errors = <ValidatorResult>this.control.errors;
            var key = Object.keys(errors)[0];
            this.error = errors[key];
        } else
            this.error = null;
    }
}

export default ControlErrorComponent;
