import {Injectable} from  "angular2/core";

import SocketService from "./common/socket.service";
import UserIOModel from "../../../common/models/io/common/user.io.model";

@Injectable()
class TopService extends SocketService {

    public connect() {
        this.initialize("top");
    }

    public set onDelete(cb: () => void) {
        this.on("delete", (response) => {
            cb();
        });
    }

    public set onUpdate(cb: (user: UserIOModel) => void) {
        this.on("update", (response) => {
            cb(new UserIOModel(response.models.user));
        });
    }
}

export default TopService;
