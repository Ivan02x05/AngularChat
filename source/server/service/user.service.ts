/// <reference path="../../../typings/tsd.d.ts"/>

import * as Q from "q";

import BaseService from "./common/base.service";
import {service, method} from "./common/service.decorator";
import {UserModel, UserGetModel} from "../../common/models/impl/common/user.model";
import UserInfoModel from "../../common/models/impl/common/user.info.model";
import UserBusiness from "../business/user.business";
import SessionManerger from "../common/manergers/session.manerger";
import {ErrorConstant} from "../../common/constants/error.constant";
import Exception from "../common/exceptions/exception";

@service
class UserService extends BaseService {

    @method()
    public getList(): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(UserBusiness);

        return business.getList()
            .then(_ => {
                result.add("users", _);
            });
    }

    @method()
    public getUser(model: UserGetModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(UserBusiness);
        var session = this.getComponent(SessionManerger);

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
    public regist(model: UserModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(UserBusiness);
        var session = this.getComponent(SessionManerger);

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
    public update(model: UserModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(UserBusiness);
        var session = this.getComponent(SessionManerger);

        return business.findById(model._id)
            .then<UserModel>(_ => {
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
    public delete(model: UserModel): Q.Promise<any> {
        var result = this.result;
        var business = this.getComponent(UserBusiness);
        var session = this.getComponent(SessionManerger);

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
