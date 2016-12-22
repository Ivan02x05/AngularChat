import * as Q from "q";

import {WwwBaseController, Container, controller, method} from "../common/www.base.controller";
import UserService from "../../../service/user.service";
import ServiceResult from "../../../service/common/service.result";
import {UserIOModel} from "../../../../common/models/io/common/user.io.model";
import UserInfoIOModel from "../../../../common/models/io/common/user.info.io.model";
import TopController from "../socket/top.controller";
import {ScaleoutClient} from "../../scaleout/client";
import {SystemConstant} from "../../../common/constants/system.constant";
import UserScaleoutModel from "../../scaleout/models/common/user.scaleout.model";

@controller()
class UserController extends WwwBaseController {

    @method()
    protected list(service?: UserService): Q.Promise<void> {
        return service.getList()
            .then((result: ServiceResult) => {
                this.json(result);
            });
    }

    @method()
    protected loginedlist(service?: UserService): Q.Promise<void> {
        return service.getList()
            .then((result: ServiceResult) => {
                const users = <UserInfoIOModel[]>result.get("users");
                const scaleout = Container.resolve(ScaleoutClient);
                scaleout.get(SystemConstant.Scaleout.Events.Provide.Common.LOGIN_USER)
                    .then((logins: UserScaleoutModel[]) => logins.map(_ => _.user._id))
                    .then(logins => {
                        users.forEach(_ => {
                            _.logined = logins.filter(l => l == _._id).length > 0;
                        });
                    })
                    .then(() => {
                        this.json(result);
                    });
            });
    }

    @method()
    protected user(model?: UserIOModel, service?: UserService): Q.Promise<void> {
        return service.getUser(model)
            .then((result: ServiceResult) => {
                this.json(result);
            });
    }

    @method()
    protected regist(model?: UserIOModel, service?: UserService): Q.Promise<void> {
        return service.regist(model)
            .then((result: ServiceResult) => {
                this.json(result);
            });
    }

    @method()
    protected update(model?: UserIOModel, service?: UserService): Q.Promise<void> {
        return service.update(model)
            .then((result: ServiceResult) => {
                const user: UserIOModel = <UserIOModel>result.get("user");
                const scaleout = Container.resolve(ScaleoutClient);
                if (this.session.user._id == user._id)
                    this.session.user = user;

                scaleout.publish(SystemConstant.Scaleout.Events.Subscribe.Common
                    .USER_UPDATE, new UserScaleoutModel({
                        sender: this.session.id,
                        user: user
                    }));

                this.json(result);
            });
    }

    @method()
    protected delete(model?: UserIOModel, service?: UserService): Q.Promise<void> {
        return service.delete(model)
            .then((result: ServiceResult) => {
                const user: UserIOModel = <UserIOModel>result.get("user");
                const scaleout = Container.resolve(ScaleoutClient);

                scaleout.publish(SystemConstant.Scaleout.Events.Subscribe.Common
                    .USER_DELETE, new UserScaleoutModel({
                        sender: this.session.id,
                        user: user
                    }));

                this.json(result);
            });
    }
}

export default UserController;
