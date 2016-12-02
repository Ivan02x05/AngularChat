import {NG_VALIDATORS, AbstractControl, Validators} from "angular2/common";
import {Directive, provide} from "angular2/core";

import {ValidatorBase, ErrorConstant} from "./validator.common";

@Directive({
    selector: '[justlength-validator]',
    providers: [provide(NG_VALIDATORS, { useExisting: JustLengthValidator, multi: true })],
    inputs: ["length:justlength-validator"]
})
export class JustLengthValidator extends ValidatorBase {
    private length: number;

    public validateControl(control: AbstractControl) {
        if (this.hasError(Validators.maxLength(this.length)(control))
            || this.hasError(Validators.minLength(this.length)(control)))
            this.add(ErrorConstant.Code.Error.JUST_LENGTH,
                this.controlName, this.length.toString());
    }
}
