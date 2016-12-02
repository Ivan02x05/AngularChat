/// <reference path="../../../../../typings/tsd.d.ts"/>

import * as Q from "q";

import SessionModel from "../../../../common/models/impl/common/session.model";
import ServiceResult from "../../../service/common/service.result";
import ResponseModel from "../../../../common/models/impl/common/response.model";

abstract class BaseController {
    abstract getSession(): SessionModel;
    abstract exec(): Q.Promise<any>;

    protected execMethod(method: string): Q.Promise<any> {
        return new Function("return this." + method.toLowerCase() + "();")
            .call(this);
    }

    protected resultToModel(result: ServiceResult): ResponseModel {
        var model = new ResponseModel({ models: {}, errors: result.errors });
        result.models.forEach((v, k) => {
            model.models[k] = v;
        });
        return model;
    }
}

export default BaseController;
