import {Injectable} from  "angular2/core";
import {Http, Headers, Response} from 'angular2/http';
import {Observable} from "rxjs/Rx";

import FormComponent from "../../components/common/form.component";
import BaseIOModel from "../../../../common/models/io/common/base.io.model";
import ErrorIOModel from "../../../../common/models/io/common/error.io.model";
import ResponseIOModel from "../../../../common/models/io/common/response.io.model";
import Exception from "../../exceptions/exception";

@Injectable()
class HttpService {
    protected http: Http;

    constructor(http: Http) {
        this.http = http;
    }

    private get headers(): Headers {
        return new Headers();
    }

    private get jsonheaders(): Headers {
        const headers = this.headers;
        headers.append("Content-Type", "application/json");
        return headers;
    }

    public postJson(url: string, data?: BaseIOModel, options: any = {}): Observable<ResponseIOModel> {
        Object.assign(options, { headers: this.jsonheaders });
        return this.execute(this.http.post(url, JSON.stringify(data), options));
    }

    public getJson(url: string, options: any = {}): Observable<ResponseIOModel> {
        Object.assign(options, { headers: this.headers });
        return this.execute(this.http.get(url, options));
    }

    private execute(observable: Observable<Response>): Observable<ResponseIOModel> {
        return observable
            .map(response => response.json())
            .map(response => new ResponseIOModel(response))
            .catch(error => {
                const json = error.json();
                if (json.errors && Array.isArray(json.errors))
                    return Observable.throw(new Exception(json.errors
                        .map(_ => new ErrorIOModel(_.code, _.message, _.level))));
                else
                    return Observable.throw(new Error(error.text()));
            });
    }
}

export default HttpService;
