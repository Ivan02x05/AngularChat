import {Injectable} from  "angular2/core";

import SocketService from "./common/socket.service";
import UserModel from "../../../common/models/impl/common/user.model";

@Injectable()
class TopService extends SocketService {

    public connect() {
        this.initialize("top");
    }

    public set onLogout(cb: () => void) {
        this.on("logout", (response) => {
            cb();
        });
    }

    public set onUpdate(cb: (user: UserModel) => void) {
        this.on("update", (response) => {
            cb(new UserModel(response.models.user));
        });
    }

    public logout() {
        this.emit("logout");
    }
}

export default TopService;
