import {Injectable} from  "angular2/core";

import HttpService from "./common/http.service";

@Injectable()
class MessageService {
    private http: HttpService;
    constructor(http: HttpService) {
        this.http = http;
    }

    public list() {
        return this.http.getJson("api/message/list");
    }
}

export default MessageService;
