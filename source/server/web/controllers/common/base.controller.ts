import * as Q from "q";

export * from "./controller.decorator";
import SessionIOModel from "../../../../common/models/io/common/session.io.model";
import ServiceResult from "../../../service/common/service.result";
import ResponseIOModel from "../../../../common/models/io/common/response.io.model";

export abstract class BaseController {
    abstract getSession(): SessionIOModel;
    abstract exec(): Q.Promise<void>;

    protected execMethod(method: string): Q.Promise<any> {
        return new Function("return this." + method.toLowerCase() + "();")
            .call(this);
    }

    protected resultToIOModel(result: ServiceResult): ResponseIOModel {
        return BaseController.resultToIOModel(result);
    }

    protected static resultToIOModel(result: ServiceResult): ResponseIOModel {
        var model = new ResponseIOModel({ models: {}, errors: result.errors });
        result.models.forEach((v, k) => {
            model.models[k] = v;
        });
        return model;
    }
}

export default BaseController;
