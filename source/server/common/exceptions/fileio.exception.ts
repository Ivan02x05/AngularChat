import Exception from "./exception";
import {ErrorConstant} from "../../../common/constants/error.constant";
import ErrorIOModel from "../../../common/models/io/common/error.io.model";

class FileIOException extends Exception {
    constructor(exception?: any) {
        super(ErrorConstant.Code.Fatal.FILE_IO, null, exception);
    }
}

export default FileIOException;
