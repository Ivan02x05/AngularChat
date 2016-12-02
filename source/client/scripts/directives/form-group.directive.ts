import {Directive} from "angular2/core";

@Directive({
    selector: '.form-group',
    host: {
        "[class.has-error]": "!valid",
        "[class.has-feedback]": "!valid"
    }
})
class FormGroupDirective {
    public valid: boolean = true;
}

export default FormGroupDirective;
