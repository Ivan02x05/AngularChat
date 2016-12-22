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

    protected get headers(): Headers {
        return new Headers();
    }

    protected get jsonheaders(): Headers {
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
        return Observable.create((observer) => {
            observable
                .map((response) => response.json())
                .subscribe(
                (data) => observer.next(new ResponseIOModel(data)),
                (error) => {
                    const json = error.json();
                    if (json.errors && Array.isArray(json.errors))
                        throw new Exception(json.errors
                            .map(_ => new ErrorIOModel(_.code, _.message, _.level)));
                    else
                        throw new Error(error.text());
                },
                () => { observer.complete(); }
                );
        });
    }
}

export default HttpService;
