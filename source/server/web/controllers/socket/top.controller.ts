import * as Q from "q";

import {default as SocketBaseController, ON_MESSAGE_MAP} from "../common/socket.base.controller";
import {controller, message} from "../common/controller.decorator";
import UserModel from "../../../../common/models/impl/common/user.model";
import ResponseModel from "../../../../common/models/impl/common/response.model";

@controller
class TopController extends SocketBaseController {
    public static sockets: TopController[] = [];

    protected initialize(): ON_MESSAGE_MAP {
        return {
            "logout": this.onLogout
        };
    }

    @message()
    protected onLogout() {
        var user: UserModel = this.session.user;
        (<any>this.session).destroy(() => {
            this.emit("logout");
            SocketBaseController.onChangedSessionSubject.next(user);
        });
        return Q.resolve<void>(null);
    }

    protected onConnect() {
        super.onConnect();
        TopController.sockets.push(this);
    }

    protected onDisconnect() {
        var index = TopController.sockets.indexOf(this);
        TopController.sockets.splice(index, 1);

        super.onDisconnect();
    }

    protected onChangedSession(): Q.Promise<void> {
        return super.onChangedSession()
            .then(() => {
                if (this.session)
                    this.emit("update", new ResponseModel({ models: { user: this.session.user } }));
            });
    }
}

export default TopController;
