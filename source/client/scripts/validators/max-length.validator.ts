import {NG_VALIDATORS, AbstractControl, Validators} from "angular2/common";
import {Directive, provide} from "angular2/core";

import {ValidatorBase, ErrorConstant} from "./validator.common";

@Directive({
    selector: '[maxlength-validator]',
    providers: [provide(NG_VALIDATORS, { useExisting: MaxLengthValidator, multi: true })],
    inputs: ["length:maxlength-validator"]
})
export class MaxLengthValidator extends ValidatorBase {
    private length: number;

    public validateControl(control: AbstractControl) {
        if (this.hasError(Validators.maxLength(this.length)(control)))
            this.add(ErrorConstant.Code.Error.MAX_LENGTH,
                this.controlName, this.length.toString());
    }
}
