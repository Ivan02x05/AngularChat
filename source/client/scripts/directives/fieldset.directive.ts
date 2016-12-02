import {Directive} from "angular2/core";

@Directive({
    selector: 'fieldset',
    host: {
        "[disabled]": "disabled"
    },
    inputs: ["disabled"]
})
class FieldsetDirective {
    private disabled: boolean;
}

export default FieldsetDirective;
