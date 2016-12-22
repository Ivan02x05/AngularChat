import * as Q from "q";

import BaseService from "./common/base.service";
import {service, method} from "./common/service.decorator";
import {UserIOModel} from "../../common/models/io/common/user.io.model";
import UserInfoIOModel from "../../common/models/io/common/user.info.io.model";
import UserBusiness from "../business/user.business";
import SessionManerger from "../common/manergers/session.manerger";
import {ErrorConstant} from "../../common/constants/error.constant";
import Exception from "../common/exceptions/exception";

@service
class UserService extends BaseService {

    @method()
    public getList(): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(UserBusiness);

        return business.getList()
            .then(_ => {
                result.add("users", _);
            });
    }

    @method()
    public getUser(model: UserIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(UserBusiness);
        const session = this.getComponent(SessionManerger);

        return business.findById(model._id)
            .then(_ => {
                if (_ == null)
                    return Q.reject(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

                if (!_.canView(session.session.user))
                    return Q.reject(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

                _.password = null;
                result.add("user", _);
            });
    }

    @method()
    public regist(model: UserIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(UserBusiness);
        const session = this.getComponent(SessionManerger);

        if (!session.session.user.isAdmin)
            return Q.reject(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

        return business.findByUserIdOtherSelfCount(model.userId)
            .then(_ => {
                if (_ != 0)
                    return Q.reject(new Exception(ErrorConstant.Code.Error.DUPLICATE, ["ユーザID"]));
            })
            .then(() => business.regist(model))
            .then(_ => {

                _.password = null;
                return _;
            })
            .then(_ => {
                result.add("user", _);
            });
    }

    @method()
    public update(model: UserIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(UserBusiness);
        const session = this.getComponent(SessionManerger);

        return business.findById(model._id)
            .then<UserIOModel>(_ => {
                if (_ == null)
                    return Q.reject(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

                if (!_.canView(session.session.user))
                    return Q.reject(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

                return business.findByUserIdOtherSelfCount(model.userId, model._id)
                    .then(count => {
                        if (count != 0)
                            return Q.reject(new Exception(ErrorConstant.Code.Error.DUPLICATE, ["ユーザID"]));
                        return _;
                    })
            })
            .then(_ => {
                if (!session.session.user.isAdmin
                    || session.session.user._id !== model._id)
                    model.role = _.role;
            })
            .then(() => business.update(model))
            .then(_ => {

                _.password = null;
                return _;
            })
            .then(_ => {
                result.add("user", _);
            });
    }

    @method()
    public delete(model: UserIOModel): Q.Promise<any> {
        const result = this.result;
        const business = this.getComponent(UserBusiness);
        const session = this.getComponent(SessionManerger);

        if (!session.session.user.isAdmin
            || session.session.user._id == model._id)
            return Q.reject(new Exception(ErrorConstant.Code.Fatal.UN_DEFINED));

        return business.delete(model)
            .then(_ => {

                _.password = null;
                return _;
            })
            .then(_ => {
                result.add("user", _);
            });
    }
}

export default UserService;
