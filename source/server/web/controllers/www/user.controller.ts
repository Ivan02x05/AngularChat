import * as Q from "q";

import WWWBaseController from "../common/www.base.controller";
import {controller, method} from "../common/controller.decorator";
import UserService from "../../../service/user.service";
import ServiceResult from "../../../service/common/service.result";
import {UserModel, UserGetModel} from "../../../../common/models/impl/common/user.model";
import UserInfoModel from "../../../../common/models/impl/common/user.info.model";
import TopController from "../socket/top.controller";

@controller
class UserController extends WWWBaseController {

    @method({ services: [UserService] })
    protected list(service?: UserService): Q.Promise<void> {
        return service.getList()
            .then((result: ServiceResult) => {
                this.json(result);
            });
    }

    @method({ services: [UserService] })
    protected loginedlist(service?: UserService): Q.Promise<void> {
        return service.getList()
            .then((result: ServiceResult) => {
                var users = <UserInfoModel[]>result.get("users");

                users.forEach(_ => {
                    _.logined = TopController.sockets.filter(s => s.session.user._id == _._id).length > 0;
                });

                this.json(result);
            });
    }

    @method({ model: UserGetModel, services: [UserService] })
    protected user(model?: UserGetModel, service?: UserService): Q.Promise<void> {
        return service.getUser(model)
            .then((result: ServiceResult) => {
                this.json(result);
            });
    }

    @method({ model: UserModel, services: [UserService] })
    protected regist(model?: UserModel, service?: UserService): Q.Promise<void> {
        return service.regist(model)
            .then((result: ServiceResult) => {
                this.json(result);
            });
    }

    @method({ model: UserModel, services: [UserService] })
    protected update(model?: UserModel, service?: UserService): Q.Promise<void> {
        return service.update(model)
            .then((result: ServiceResult) => {
                this.json(result);

                var user: UserModel = <UserModel>result.get("user");
                TopController.sockets
                    .filter(_ => _.session.user._id == user._id)
                    .forEach(_ => {
                        _.session.user = user;
                        (<any>_.session).save(() => {
                            TopController.onChangedSessionSubject.next(user);
                        });
                    });
            });
    }

    @method({ model: UserModel, services: [UserService] })
    protected delete(model?: UserModel, service?: UserService): Q.Promise<void> {
        return service.delete(model)
            .then((result: ServiceResult) => {
                this.json(result);

                var user: UserModel = <UserModel>result.get("user");
                TopController.sockets
                    .filter(_ => _.session.user._id == user._id)
                    .forEach(_ => {
                        (<any>_.session).destroy(() => {
                            _.emit("logout");
                            TopController.onChangedSessionSubject.next(user);
                        });
                    });
            });
    }
}

export default UserController;
