import {EventEmitter} from "angular2/core";
import {FORM_DIRECTIVES as ORG_FORM_DIRECTIVES, NgForm} from "angular2/common";

import UserModel from "../../../../common/models/impl/common/user.model";
import MessageModel from "../../../../common/models/impl/common/message.model";
import ErrorModel from "../../../../common/models/impl/common/error.model";
import InjectManerger from "../../manergers/inject.manerger";
import MessageManerger from "../../manergers/message.manerger";
import * as ValidatorCommon from "../../validators/validator.common";
import {CodeConstant} from "../../../../common/constants/code.constant";
import UserManerger from "../../manergers/user.manerger";

abstract class FormComponent {
    public form: NgForm;
    public errorChanges: EventEmitter<ErrorModel[]> = new EventEmitter<ErrorModel[]>();

    protected user: UserModel;
    protected errors: ErrorModel[] = [];

    constructor() {
        this.user = UserManerger.instanse.user;
    }

    private get messageMgr(): MessageManerger {
        return InjectManerger.injector.get(MessageManerger);
    }

    protected getMessage(code: string, args?: string[]): MessageModel {
        return this.messageMgr.getMessage(code, args);
    }

    protected get hasError(): boolean {
        return this.errors.length != 0;
    }

    protected addError(value: string | ErrorModel | ErrorModel[], ...params: string[]) {
        if (Array.isArray(value)) {
            for (var e of <ErrorModel[]>value)
                this.errors.push(e);
        } else if (value instanceof ErrorModel) {
            this.errors.push(<ErrorModel>value);
        } else {
            var message = this.getMessage(<string>value, params);
            this.errors.push(new ErrorModel(message.code,
                message.message, message.level));
        }
        this.emitErrorChanges();
    }

    protected clearError(): number {
        var length = this.errors.length;
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
        var controls = this.form.controls;
        for (var c in controls) {
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
