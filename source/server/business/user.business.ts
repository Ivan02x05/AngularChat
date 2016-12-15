import * as Q from "q";

import BaseBusiness from "./common/base.business";
import UserSchema from "../database/schemas/user.schema";
import UserIOModel from "../../common/models/io/common/user.io.model";
import * as security from "../common/utils/security.util";
import DivisionManerger from "../common/manergers/division.manerger";
import {CodeConstant} from "../../common/constants/code.constant";

class UserBusiness extends BaseBusiness {

    public getList(): Q.Promise<UserIOModel[]> {
        return this.database.model(UserSchema)
            .find({ "systemColumn.deleteFlag": false })
            .then(result => result.map(_ => new UserIOModel(_)))
            .then(result => {
                result.forEach(_ => {
                    _.password = security.decryption(_.password);
                });

                return result;
            });
    }

    public findById(id: any): Q.Promise<UserIOModel> {
        return this.database.model(UserSchema)
            .findById(id)
            .then(result => {
                if (result && !result.systemColumn.deleteFlag)
                    return result;
                else
                    return null;
            })
            .then(result => new UserIOModel(result))
            .then(result => {
                result.password = security.decryption(result.password);
                return result;
            });
    }

    public findByUserId(userId: string): Q.Promise<UserIOModel> {
        return this.database.model(UserSchema)
            .find({ userId: userId, "systemColumn.deleteFlag": false })
            .then(result => {
                if (!result || result.length == 0)
                    return null
                else {
                    var user = new UserIOModel(result[0]);
                    user.password = security.decryption(user.password);
                    return user;
                }
            });
    }

    public findByUserIdOtherSelfCount(userId: string, _id?: any): Q.Promise<number> {
        var cond: any = { userId: userId };
        if (_id != null)
            cond._id = { "$ne": _id };

        return this.database.model(UserSchema)
            .find(cond)
            .then(result => result.length);
    }

    public regist(model: UserIOModel): Q.Promise<UserIOModel> {
        var users = this.database.model(UserSchema);
        var user = users.toDocument(model);
        user.password = security.encryption(user.password);

        return users.save(user)
            .then(result => new UserIOModel(result))
            .then(result => {
                result.password = security.decryption(result.password);
                return result
            });
    }

    public update(model: UserIOModel): Q.Promise<UserIOModel> {
        var users = this.database.model(UserSchema);
        var division = this.getComponent(DivisionManerger);

        return users.findById(model._id)
            .then(_ => {
                _.userId = model.userId;
                if (model.password != null)
                    _.password = security.encryption(model.password);

                _.name = model.name;
                _.mode = model.mode;
                _.systemColumn.version = model.systemColumn.version;

                return users.save(_);
            })
            .then(result => new UserIOModel(result))
            .then(result => {
                result.password = security.decryption(result.password);
                return result
            });
    }

    public delete(model: UserIOModel): Q.Promise<UserIOModel> {
        return this.database.model(UserSchema).delete(model)
            .then(result => new UserIOModel(result))
            .then(result => {
                result.password = security.decryption(result.password);
                return result
            });
    }
}

export default UserBusiness;
