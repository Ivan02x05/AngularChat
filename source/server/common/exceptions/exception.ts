import MessageManerger from "../manergers/message.manerger";
import AbstractException from "../../../common/exceptions/exception";
import Container from "../container/container";

class Exception extends AbstractException {
    protected getManerger(): MessageManerger {
        // importすると参照矛盾となる
        return Container.resolve(require("../manergers/message.manerger").default);
    }
}

export default Exception;
