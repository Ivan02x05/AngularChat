import {Schema, Model}  from "mongoose";
import BaseSchema from "../schemas/base.schema";
import UserInfoSchema from "../schemas/user.info.schema";
import BaseDocument from "../documents/base.document";
import BaseDBModel from "../models/base.db.model";
import {ErrorConstant} from "../../../common/constants/error.constant";
import SessionManerger from "../../common/manergers/session.manerger";
import MessageManerger from "../../common/manergers/message.manerger";
import Container from "../../common/container/container";
import Exception from "../../common/exceptions/exception";
import UserInfoIOModel from "../../../common/models/io/common/user.info.io.model";

export = (schema: BaseSchema<BaseDBModel<BaseDocument>>, options: any = {}) => {
    if (!options.nosystem) {
        schema.add({ systemColumn: commonSchema() });
    }
    schema.pre("validate", preValidate);
};

const commonSchema = function(): Object {
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

const preValidate = function(next: Function) {
    const self: BaseDocument = <BaseDocument>this;

    if ((<any>self.schema).tree.systemColumn) {
        setCommonFields(self)
    }
    next();
}

const setCommonFields = (target: BaseDocument) => {
    const session: SessionManerger = Container
        .resolve(SessionManerger, target.dbmodel);

    if (target.isNew) {
        target.systemColumn.createUser = new UserInfoIOModel(session.session.user);
        target.systemColumn.createDate = BaseDBModel.sysDate;
        target.systemColumn.version = 0;
    }

    target.systemColumn.version++;
    if (target.systemColumn.version > Number.MAX_VALUE)
        // default is 1
        target.systemColumn.version = 1;

    target.systemColumn.updateUser = new UserInfoIOModel(session.session.user);
    target.systemColumn.updateDate = BaseDBModel.sysDate;
}

function checkVersion(v: number, cb: (result: boolean) => void) {
    const target: BaseDocument = <BaseDocument>this;
    if (target.isNew) {
        cb(true);
        return;
    }

    target.dbmodel.findById(target._id).then((document: BaseDocument) => {
        // ヴァリデーション前処理で1加算してるため、減算し比較する

        if (document == null)
            cb(false);
        else if (v - 1 == Number.MAX_VALUE)
            cb(document.systemColumn.version == 1);
        else
            cb(v - 1 == document.systemColumn.version);
    });
}
