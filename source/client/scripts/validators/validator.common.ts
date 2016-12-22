import {Validator, NG_VALIDATORS, AbstractControl} from "angular2/common";
import {Input} from "angular2/core";

import ErrorIOModel from "../../../common/models/io/common/error.io.model";
export {ErrorConstant} from "../../../common/constants/error.constant";
import InjectManerger from "../manergers/inject.manerger";
import MessageManerger from "../manergers/message.manerger";

export interface ValidatorResult { [key: string]: ErrorIOModel; }

export abstract class ValidatorBase implements Validator {
    @Input("control-name") protected controlName: string;
    protected result: ValidatorResult;
    protected manerger: MessageManerger;

    validate(control: AbstractControl): ValidatorResult {
        this.result = {};
        this.validateControl(control);
        return this.result;
    }

    abstract validateControl(control: AbstractControl);

    protected add(code: string, ...params: string[]) {
        const manerger: MessageManerger = InjectManerger.injector.get(MessageManerger);
        const message = manerger.getMessage(code, params);
        this.result[code] = new ErrorIOModel(message.code,
            message.message, message.level);
    }

    protected hasError(result: { [key: string]: any }): boolean {
        return result && Object.keys(result).length > 0;
    }
}

import {RequiredValidator} from "./required.validator";
import {MinLengthValidator} from "./min-length.validator";
import {MaxLengthValidator} from "./max-length.validator";
import {JustLengthValidator} from "./just-length.validator";
import {EqualsValidator} from "./equals.validator";

export const VALIDATOR_DIRECTIVES = [
    RequiredValidator,
    MinLengthValidator,
    MaxLengthValidator,
    JustLengthValidator,
    EqualsValidator
];
