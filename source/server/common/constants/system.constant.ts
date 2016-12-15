export namespace SystemConstant {
    export namespace Scaleout {
        export namespace Events {
            export namespace Subscribe {
                export namespace Common {
                    export const SESSION_CHANGE: string = "common#sessionchange";
                    export const USER_UPDATE: string = "common#userupdate";
                    export const USER_DELETE: string = "common#userdelete";
                    export const REQUEST: string = "common#request";
                    export const RESPONSE: string = "common#response";
                }
                export namespace Chat {
                    export const REGIST: string = "chat#regist";
                    export const UPDATE: string = "chat#update";
                    export const DELETE: string = "chat#delete";
                    export const ADD_MESSAGE: string = "chat#addmessage";
                }
            }
            export namespace Provide {
                export namespace Common {
                    export const LOGIN_USER: string = "common#loginuser";
                }
            }
        }
    }
}
