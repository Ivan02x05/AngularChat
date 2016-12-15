import Exception from "./exception";
import {ErrorConstant} from "../../../common/constants/error.constant";
import ErrorIOModel from "../../../common/models/io/common/error.io.model";

class DataBaseException extends Exception {
    constructor(exception: Exception | ErrorIOModel | ErrorIOModel[] | any) {
        if (exception instanceof Exception)
            super((<Exception>exception).errors);
        else if (Array.isArray(exception))
            super(<ErrorIOModel[]>exception);
        else if (exception instanceof ErrorIOModel)
            super(<ErrorIOModel>exception);
        else {
            super(ErrorConstant.Code.Fatal.DB_QUERY, null, exception);
        }
    }
}

export default DataBaseException;
