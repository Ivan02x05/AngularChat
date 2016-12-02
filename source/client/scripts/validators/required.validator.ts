import {NG_VALIDATORS, AbstractControl, Validators} from "angular2/common";
import {Directive, provide, Input} from "angular2/core";

import {ValidatorBase, ErrorConstant} from "./validator.common";

@Directive({
    selector: '[required-validator]',
    providers: [provide(NG_VALIDATORS, { useExisting: RequiredValidator, multi: true })],
    inputs: ["condition:required-validator"]
})
export class RequiredValidator extends ValidatorBase {
    protected condition: boolean;

    public validateControl(control: AbstractControl) {
        if (
            (
                typeof this.condition === "string"
                || this.condition
            )
            &&
            (
                this.hasError(Validators.required(control))
                || control.value.length == 0
            )
        )
            this.add(ErrorConstant.Code.Error.REQUIRED, this.controlName);
    }
}
