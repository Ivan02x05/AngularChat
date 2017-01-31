import ErrorIOModel from "../../../common/models/io/common/error.io.model";
import {ErrorConstant} from "../../../common/constants/error.constant";
import {Container} from "../../common/container/container";
import MessageManerger from "../../common/manergers/message.manerger";

function required(value: any, name: string): ErrorIOModel {
    if (value == null || value.length == 0)
        return createError(ErrorConstant.Code.Error.REQUIRED, name);
}

function maxlength(value: any, length: number, name: string): ErrorIOModel {
    if (value != null && value.length > length)
        return createError(ErrorConstant.Code.Error.MAX_LENGTH, name, length.toString());
}

function minlength(value: any, length: number, name: string): ErrorIOModel {
    if (value != null && value.length < length)
        return createError(ErrorConstant.Code.Error.MIN_LENGTH, name, length.toString());
}

function justlength(value: any, length: number, name: string): ErrorIOModel {
    if (value != null && value.length != length)
        return createError(ErrorConstant.Code.Error.JUST_LENGTH, name, length.toString());
}

function createError(code: string, ...params: string[]): ErrorIOModel {
    const manerger = <MessageManerger>Container.resolve(MessageManerger);
    const message = manerger.getMessage(code, params);
    return new ErrorIOModel(message.code, message.message, message.level)
}

export function configValidator(config: any, target: any): ErrorIOModel[] {
    const errors: ErrorIOModel[] = [];

    if (!config)
        return null;

    if (config.name) {
        // object以外
        config = { dummy: config };
        target = { dummy: target };
    }

    for (var c in config) {
        var validators = config[c].validators;
        for (var v in validators) {
            var error: ErrorIOModel;
            var value = null;
            var keys = c.split(".");
            if (target != null) {
                value = target;
                keys.forEach(_ => {
                    value = value[_];
                });
            }
            var name = config[c].name;
            switch (v) {
                case "required":
                    error = required(value, name);
                    break;
                case "minlength":
                    error = minlength(value, <number>validators[v].length, name);
                    break;
                case "maxlength":
                    error = maxlength(value, <number>validators[v].length, name);
                    break;
                case "justlength":
                    error = justlength(value, <number>validators[v].length, name);
                    break;
                default:
                    error = null;
                    break;
            }

            if (error) {
                errors.push(error);
                break;
            }
        }
    }

    return errors.length == 0 ? null : errors;
}
