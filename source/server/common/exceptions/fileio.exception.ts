import Exception from "./exception";
import {ErrorConstant} from "../../../common/constants/error.constant";
import ErrorModel from "../../../common/models/impl/common/error.model";

class FileIOException extends Exception {
    constructor(exception?: any) {
        super(ErrorConstant.Code.Fatal.FILE_IO, null, exception);
    }
}

export default FileIOException;
