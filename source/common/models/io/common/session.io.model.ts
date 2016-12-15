import UserIOModel from "./user.io.model";

declare interface SessionCookie {
    originalMaxAge: number;
    path: string;
    maxAge: number;
    secure?: boolean;
    httpOnly: boolean;
    domain?: string;
    expires: Date;
    serialize: (name: string, value: string) => string;
}

declare class Session {
    id: string;
    regenerate: (callback: (err: any) => void) => void;
    destroy: (callback: (err: any) => void) => void;
    reload: (callback: (err: any) => void) => void;
    save: (callback: (err: any) => void) => void;
    touch: () => Session;

    cookie: SessionCookie;
}

export class SessionIOModel extends Session {
    public user: UserIOModel;
}

export default SessionIOModel;
