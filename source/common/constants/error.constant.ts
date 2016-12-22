export namespace ErrorConstant {
    export enum ErrorLevel {
        Info = 1,
        Warning,
        Error,
        Fatal
    }

    export namespace Code {
        export namespace Prefix {
            export const INFO: string = "I";
            export const WARNING: string = "W";
            export const ERROR: string = "E";
            export const FATAL: string = "F";
        }
        export namespace Info {
            export const UNREAD: string = Prefix.INFO + "001";
        }
        export namespace Warning {
        }
        export namespace Error {
            export const EXCLUTION: string = Prefix.ERROR + "001";
            export const DATA_NOT_FOUND: string = Prefix.ERROR + "002";
            export const FAILURE_LOGIN: string = Prefix.ERROR + "003";
            export const REQUIRED: string = Prefix.ERROR + "100";
            export const MIN_LENGTH: string = Prefix.ERROR + "101";
            export const MAX_LENGTH: string = Prefix.ERROR + "102";
            export const JUST_LENGTH: string = Prefix.ERROR + "103";
            export const EQUALS: string = Prefix.ERROR + "104";
            export const DUPLICATE: string = Prefix.ERROR + "105";
            export const FRAUND: string = Prefix.ERROR + "106";
            export const CANT_FOR: string = Prefix.ERROR + "107";
        }
        export namespace Fatal {
            export const INSTANCE_DUPLICATE: string = Prefix.FATAL + "001";
            export const NON_IMPLEMENT: string = Prefix.FATAL + "002";
            export const DB_QUERY: string = Prefix.FATAL + "003";
            export const SESSION_TIMEOUT: string = Prefix.FATAL + "004";
            export const FILE_IO: string = Prefix.FATAL + "005";
            export const COMMUNICATION_TIMEOUT: string = Prefix.FATAL + "006";
            export const UN_DEFINED: string = Prefix.FATAL + "999";
        }
    }

    export function getLevelFromCode(code: string): ErrorLevel {
        if (code == null || code.length < 1)
            return null;

        const c: string = code.substring(0, 1);
        let error: ErrorLevel;
        switch (c) {
            case Code.Prefix.INFO:
                error = ErrorLevel.Info;
                break;
            case Code.Prefix.WARNING:
                error = ErrorLevel.Warning;
                break;
            case Code.Prefix.ERROR:
                error = ErrorLevel.Error;
                break;
            case Code.Prefix.FATAL:
                error = ErrorLevel.Fatal;
                break;
            default:
                error = null;
                break;
        }

        return error;
    }
}
