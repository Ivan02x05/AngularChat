import {Directive, HostMetadata, OnInit, EventEmitter} from "angular2/core";
import {NgForm} from "angular2/common";

import FormComponent from "../components/common/form.component";
import ErrorIOModel from "../../../common/models/io/common/error.io.model";

@Directive({
    selector: 'form',
    host: {
        "novalidate": ""
    }
})
@(<any>Reflect).metadata("parameters", [[new HostMetadata()]])
class FormDirective implements OnInit {
    private ngForm: NgForm;
    private formCmp: FormComponent;

    public errorChanges: EventEmitter<ErrorIOModel[]> = new EventEmitter<ErrorIOModel[]>();

    constructor(ngForm: NgForm, formCmp: FormComponent) {
        this.ngForm = ngForm;
        this.formCmp = formCmp;
        this.formCmp.form = this.ngForm;
    }

    public ngOnInit() {
        this.formCmp.errorChanges.subscribe(
            (data) => this.errorChanges.emit(data)
        );
    }
}

export default FormDirective;
