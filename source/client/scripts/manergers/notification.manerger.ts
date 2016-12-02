import {Injectable} from  "angular2/core";

import UserManerger from "./user.manerger";

const _Notification = window["Notification"];
const DISPLAY_TIME = 3000;
const ICON = "images/notification.jpg";

@Injectable()
class NotificationManerger {
    private manerger: UserManerger;

    constructor(manerger: UserManerger) {
        this.manerger = manerger;
    }

    public notification(title: string, body: string, cb?: () => void) {
        if (!document.hasFocus()) {
            if (!this.manerger.authenticated || !this.manerger.user.isSecret) {
                var not = new _Notification(title, { body: body, icon: ICON });
                setTimeout(() => {
                    not.close();
                }, DISPLAY_TIME);

                not.onclick = () => {
                    not.close();
                    window.focus();
                    if (cb)
                        cb();
                };
            }
        }
    }

    public static requestPermission() {
        if (_Notification.permission != "granted") {
            _Notification.requestPermission();
        }
    }
}

export default NotificationManerger;
