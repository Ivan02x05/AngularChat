import {Injectable} from  "angular2/core";

import HttpService from "./common/http.service";

@Injectable()
class DivisionService {
    private http: HttpService;
    constructor(http: HttpService) {
        this.http = http;
    }

    public list() {
        return this.http.getJson("api/division/list");
    }
}

export default DivisionService;
