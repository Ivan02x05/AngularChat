import {NG_VALIDATORS, AbstractControl, Validators} from "angular2/common";
import {Directive, provide} from "angular2/core";

import {ValidatorBase, ErrorConstant} from "./validator.common";

@Directive({
    selector: '[minlength-validator]',
    providers: [provide(NG_VALIDATORS, { useExisting: MinLengthValidator, multi: true })],
    inputs: ["length:minlength-validator"]
})
export class MinLengthValidator extends ValidatorBase {
    private length: number;

    public validateControl(control: AbstractControl) {
        if (this.hasError(Validators.required(control))
            || control.value.length == 0)
            return;

        if (this.hasError(Validators.minLength(this.length)(control)))
            this.add(ErrorConstant.Code.Error.MIN_LENGTH,
                this.controlName, this.length.toString());
    }
}
