import {NG_VALIDATORS, AbstractControl, Validators} from "angular2/common";
import {Directive, provide} from "angular2/core";

import {ValidatorBase, ErrorConstant} from "./validator.common";

@Directive({
    selector: '[equals-validator]',
    providers: [provide(NG_VALIDATORS, { useExisting: EqualsValidator, multi: true })],
    inputs: ["equals:equals-validator"]
})
export class EqualsValidator extends ValidatorBase {
    private equals: HTMLInputElement;

    public validateControl(control: AbstractControl) {
        if (
            !((control.value == null || control.value == "")
                && (this.equals.value == null || this.equals.value == ""))
            && control.value != this.equals.value)
            this.add(ErrorConstant.Code.Error.EQUALS,
                this.controlName, this.equals.attributes["control-name"].value);
    }
}
