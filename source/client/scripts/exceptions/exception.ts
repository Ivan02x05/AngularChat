import MessageManerger from "../manergers/message.manerger";
import InjectManerger from "../manergers/inject.manerger";
import AbstractException from "../../../common/exceptions/exception";

class Exception extends AbstractException {
    protected getManerger(): MessageManerger {
        return InjectManerger.injector.get(MessageManerger);
    }
}

export default Exception;
