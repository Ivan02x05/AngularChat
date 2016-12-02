import Exception from "./exception";
import {ErrorConstant} from "../../../common/constants/error.constant";
import ErrorModel from "../../../common/models/impl/common/error.model";

class DataBaseException extends Exception {
    constructor(exception: Exception | ErrorModel | ErrorModel[] | any) {
        if (exception instanceof Exception)
            super((<Exception>exception).errors);
        else if (exception instanceof ErrorModel)
            super(<ErrorModel>exception);
        else if (Array.isArray(exception))
            super(<ErrorModel[]>exception);
        else {
            super(ErrorConstant.Code.Fatal.DB_QUERY, null, exception);
        }
    }
}

export default DataBaseException;
