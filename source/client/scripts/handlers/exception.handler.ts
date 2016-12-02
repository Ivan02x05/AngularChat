import {ExceptionHandler as OrgExceptionHandler} from "angular2/core";
import { DOM } from 'angular2/src/platform/dom/dom_adapter';

import ApplicationErrorDirective from "../directives/application.error.directive";
import Exception from "../exceptions/exception";
import {ErrorConstant} from "../../../common/constants/error.constant";

class ExceptionHandler extends OrgExceptionHandler {
    constructor() {
        super(DOM, false);
    }

    public call(exception: any, stackTrace?: any, reason?: string) {
        super.call(exception, stackTrace, reason);
        if (!(exception instanceof Exception))
            exception = new Exception(ErrorConstant.Code.Fatal.UN_DEFINED);

        if (ApplicationErrorDirective.exception == null)
            ApplicationErrorDirective.errorChanges.next(<Exception>exception);
    }
}

export default ExceptionHandler
