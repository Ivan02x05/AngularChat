import SessionIOModel from "../../../common/models/io/common/session.io.model";

class SessionManerger {
    public session: SessionIOModel;

    constructor(session: SessionIOModel) {
        this.session = session;
    }
}

export default SessionManerger;
