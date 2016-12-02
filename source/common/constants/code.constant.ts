export namespace CodeConstant {
    export namespace Division {
        export namespace Code {
            export const ACCESS_PERMISSION: string = "001";
            export const ROLE: string = "002";
            export const MESSAGE_TYPE: string = "003";
            export const DISPLAY_MODE: string = "004";
        }

        export namespace SubCode {
            export namespace AccessPermission {
                export const ALL: string = "01";
                export const LIMIT: string = "02";
            }
            export namespace Role {
                export const USER: string = "01";
                export const ADMINISTRATOR: string = "02";
            }
            export namespace MessageType {
                export const TEXT: string = "01";
                export const IMAGE: string = "02";
                export const VIDEO: string = "03";
                export const FILE: string = "04";
                export const UNREAD: string = "99";
            }
            export namespace DisplayMode {
                export const NORMAL: string = "01";
                export const SECRET: string = "02";
            }
        }
    }
}
