import {EventEmitter} from "angular2/core";
import {FORM_DIRECTIVES as ORG_FORM_DIRECTIVES, NgForm} from "angular2/common";

import UserIOModel from "../../../../common/models/io/common/user.io.model";
import MessageIOModel from "../../../../common/models/io/common/message.io.model";
import ErrorIOModel from "../../../../common/models/io/common/error.io.model";
import InjectManerger from "../../manergers/inject.manerger";
import MessageManerger from "../../manergers/message.manerger";
import * as ValidatorCommon from "../../validators/validator.common";
import {CodeConstant} from "../../../../common/constants/code.constant";
import UserManerger from "../../manergers/user.manerger";

abstract class FormComponent {
    public form: NgForm;
    public errorChanges: EventEmitter<ErrorIOModel[]> = new EventEmitter<ErrorIOModel[]>();

    protected user: UserIOModel;
    protected errors: ErrorIOModel[] = [];

    constructor() {
        this.user = UserManerger.instanse.user;
    }

    private get messageMgr(): MessageManerger {
        return InjectManerger.injector.get(MessageManerger);
    }

    protected getMessage(code: string, args?: string[]): MessageIOModel {
        return this.messageMgr.getMessage(code, args);
    }

    protected get hasError(): boolean {
        return this.errors.length != 0;
    }

    protected addError(value: string | ErrorIOModel | ErrorIOModel[], ...params: string[]) {
        if (Array.isArray(value)) {
            for (let e of <ErrorIOModel[]>value)
                this.errors.push(e);
        } else if (value instanceof ErrorIOModel) {
            this.errors.push(<ErrorIOModel>value);
        } else {
            const message = this.getMessage(<string>value, params);
            this.errors.push(new ErrorIOModel(message.code,
                message.message, message.level));
        }
        this.emitErrorChanges();
    }

    protected clearError(): number {
        const length = this.errors.length;
        this.errors = [];
        this.emitErrorChanges();
        return length;
    }

    private emitErrorChanges() {
        this.errorChanges.emit(this.errors);
    }

    protected get division() {
        return CodeConstant.Division;
    }

    protected submit(cb: () => void) {
        this.clearError();
        const controls = this.form.controls;
        for (let c in controls) {
            controls[c].updateValueAndValidity();
        }
        setTimeout(() => {
            if (this.form.valid) {
                cb();
            }
        }, 0);
    }
}

export default FormComponent;

import ControlErrorComponent from "./control.error.component";
import FormErrorComponent from "./form.error.component";
import FormDirective from "../../directives/form.directive";
import FieldsetDirective from "../../directives/fieldset.directive";
import FormGroupDirective from "../../directives/form-group.directive";
import HeaderComponent from "./header.component";
import UsersCheckboxComponent from "./users-checkbox.component";
import DivisionRadioComponent from "./division-radio.component";

export const FORM_DIRECTIVES = [
    ORG_FORM_DIRECTIVES,
    ValidatorCommon.VALIDATOR_DIRECTIVES,
    ControlErrorComponent,
    FormErrorComponent,
    FormDirective,
    FieldsetDirective,
    FormGroupDirective,
    HeaderComponent,
    UsersCheckboxComponent,
    DivisionRadioComponent
];
