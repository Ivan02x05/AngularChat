/// <reference path="../../../typings/tsd.d.ts"/>

import * as Q from "q";

import BaseService from "./common/base.service";
import ServideResult from "./common/service.result";
import {service, method} from "./common/service.decorator";
import DivisionManerger from "../common/manergers/division.manerger";
import DivisionModel from "../../common/models/impl/common/division.model";

@service
class DivisionService extends BaseService {

    @method()
    public getList(): Q.Promise<any> {
        return Q.fcall<void>(() => {
            var result: ServideResult = this.result;
            var manerger = BaseService.getComponent(DivisionManerger);

            // convert
            var divisions: DivisionModel[] = [];
            manerger.divisions.forEach(v1 => {
                v1.forEach(v2 => {
                    divisions.push(v2);
                });
            });
            result.add("divisions", divisions);
        });
    }
}

export default DivisionService;
