import * as Q from "q";

import BaseIOModel from "../../../../../common/models/io/common/base.io.model";
import BaseScaleoutModel from "./base.scaleout.model";

export class RequestScaleoutModel extends BaseScaleoutModel {
    public requestId: string;
    public channel: string;
    public model: BaseScaleoutModel;

    constructor(obj?: any) {
        super(obj);

        BaseIOModel.setValues(this, "requestId", String, obj);
        BaseIOModel.setValues(this, "channel", String, obj);
        BaseIOModel.setValues(this, "model", (model) => model, obj);
    }
}

export class RequestedScaleoutModel extends BaseScaleoutModel {
    public requestId: string;
    public channel: string;
    public responses: BaseScaleoutModel[];
    public targets: number;
    public responsed: number;
    public timeout: number;
    public callback: Q.Deferred<BaseScaleoutModel[]>;

    constructor(obj?: any) {
        super(obj);

        BaseIOModel.setValues(this, "requestId", String, obj);
        BaseIOModel.setValues(this, "channel", String, obj);
        BaseIOModel.setValues(this, "responses", (response) => response, obj, []);
        BaseIOModel.setValues(this, "targets", Number, obj);
        BaseIOModel.setValues(this, "responsed", Number, obj, 0);
        BaseIOModel.setValues(this, "timeout", Number, obj);
        BaseIOModel.setValues(this, "callback", Q.defer, obj);
    }
}

export class ResponseScaleoutModel extends BaseScaleoutModel {
    public requestId: string;
    public responses: BaseScaleoutModel[];

    constructor(obj?: any) {
        super(obj);

        BaseIOModel.setValues(this, "requestId", String, obj);
        BaseIOModel.setValues(this, "responses", (response) => response, obj, []);
    }
}
