import * as Q from "q";

import {default as SocketBaseController, ON_MESSAGE_MAP, controller, message, scaleout} from "../common/socket.base.controller";
import ResponseIOModel from "../../../../common/models/io/common/response.io.model";
import {SystemConstant} from "../../../common/constants/system.constant";
import UserScaleoutModel from "../../scaleout/models/common/user.scaleout.model";

@controller()
class TopController extends SocketBaseController {
    protected initialize(): ON_MESSAGE_MAP {
        return {
            "logout": this.onLogout
        };
    }

    protected onConnect() {
        return super.onConnect()
            .then(() => Q.all([
                this.provide(SystemConstant.Scaleout.Events.Provide.Common.LOGIN_USER, this.onClientProvide),
                this.subscribe(SystemConstant.Scaleout.Events.Subscribe.Common
                    .USER_UPDATE, (model: UserScaleoutModel) => {
                        if (this.session.user._id == model.user._id)
                            this.onUserUpdateSubscribe(model);
                    }
                ),
                this.subscribe(SystemConstant.Scaleout.Events.Subscribe.Common
                    .USER_DELETE, (model: UserScaleoutModel) => {
                        if (this.session.user._id == model.user._id)
                            this.onUserDeleteSubscribe(model);
                    }
                )
            ]))
            .then(() => { });
    }

    @scaleout()
    protected onUserUpdateSubscribe(model: UserScaleoutModel): Q.Promise<void> {
        this.session.user = model.user;
        return Q.nfcall(this.session.save.bind(this.session))
            .then(() => this.publish(SystemConstant.Scaleout.Events.Subscribe.Common
                .SESSION_CHANGE, model))
            .then(() => {
                this.emit("update", new ResponseIOModel({ models: { user: this.session.user } }));
            })
    }

    @scaleout()
    protected onUserDeleteSubscribe(model: UserScaleoutModel): Q.Promise<void> {
        return this.onLogout();
    }

    protected onClientProvide(): Q.Promise<UserScaleoutModel> {
        return Q.fcall(() => new UserScaleoutModel({
            sender: this.socket.id,
            user: this.session.user
        }));
    }

    @message()
    protected onLogout(): Q.Promise<void> {
        var user = this.session.user;
        return Q.nfcall(this.session.destroy.bind(this.session))
            .then(() => {
                this.emit("logout");
                this.publish(SystemConstant.Scaleout.Events.Subscribe.Common
                    .SESSION_CHANGE, new UserScaleoutModel({
                        user: user
                    }));
            });
    }
}

export default TopController;
