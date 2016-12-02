import SessionModel from "../../../common/models/impl/common/session.model";

class SessionManerger {
    public session: SessionModel;

    constructor(session: SessionModel) {
        this.session = session;
    }
}

export default SessionManerger;
