/// <reference path="../../../../typings/tsd.d.ts"/>

import {Schema, Model}  from "mongoose";
import BaseSchema from "../schemas/base.schema";
import UserInfoSchema from "../schemas/user.info.schema";
import BaseDocument from "../documents/base.document";
import BaseModel from "../models/base.model";
import {ErrorConstant} from "../../../common/constants/error.constant";
import SessionManerger from "../../common/manergers/session.manerger";
import MessageManerger from "../../common/manergers/message.manerger";
import Container from "../../common/container/container";
import Exception from "../../common/exceptions/exception";
import UserInfoModel from "../../../common/models/impl/common/user.info.model";

export = (schema: BaseSchema<BaseModel<BaseDocument>>, options: any = {}) => {
    if (!options.nosystem) {
        schema.add({ systemColumn: commonSchema() });
    }
    schema.pre("validate", preValidate);
};

var commonSchema = function(): Object {
    return {
        deleteFlag: { type: Boolean, default: false, required: true },
        version: {
            type: Number, required: true,
            validate: {
                validator: checkVersion,
                error: new Exception(ErrorConstant.Code.Error.EXCLUTION)
            }
        },
        createUser: { type: BaseSchema.getSchema(UserInfoSchema), required: true },
        createDate: { type: Date, required: true },
        updateUser: { type: BaseSchema.getSchema(UserInfoSchema), required: true },
        updateDate: { type: Date }
    };
}

var preValidate = function(next: Function) {
    var self: BaseDocument = <BaseDocument>this;

    if ((<any>self.schema).tree.systemColumn) {
        setCommonFields(self)
    }
    next();
}

var setCommonFields = (target: BaseDocument) => {
    var session: SessionManerger = Container.resolve(SessionManerger, target.creator);

    if (target.isNew) {
        target.systemColumn.createUser = new UserInfoModel(session.session.user);
        target.systemColumn.createDate = BaseModel.sysDate;
        target.systemColumn.version = 0;
    }

    target.systemColumn.version++;
    if (target.systemColumn.version > Number.MAX_VALUE)
        // default is 1
        target.systemColumn.version = 1;

    target.systemColumn.updateUser = new UserInfoModel(session.session.user);
    target.systemColumn.updateDate = BaseModel.sysDate;
}

function checkVersion(v: number, cb: (result: boolean) => void) {
    var target: BaseDocument = <BaseDocument>this;
    if (target.isNew) {
        cb(true);
        return;
    }

    target.creator.findById(target._id).then((document: BaseDocument) => {
        // ヴァリデーション前処理で1加算してるため、減算し比較する

        if (document == null)
            cb(false);
        else if (v - 1 == Number.MAX_VALUE)
            cb(document.systemColumn.version == 1);
        else
            cb(v - 1 == document.systemColumn.version);
    });
}
