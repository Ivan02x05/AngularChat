import {Injectable} from  "angular2/core";
import {Http, Headers, Response} from 'angular2/http';
import {Observable} from "rxjs/Rx";

import FormComponent from "../../components/common/form.component";
import BaseModel from "../../../../common/models/impl/common/base.model";
import ErrorModel from "../../../../common/models/impl/common/error.model";
import ResponseModel from "../../../../common/models/impl/common/response.model";
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
        var headers = this.headers;
        headers.append("Content-Type", "application/json");
        return headers;
    }

    public postJson(url: string, data?: BaseModel, options: any = {}): Observable<ResponseModel> {
        Object.assign(options, { headers: this.jsonheaders });
        return this.execute(this.http.post(url, JSON.stringify(data), options));
    }

    public getJson(url: string, options: any = {}): Observable<ResponseModel> {
        Object.assign(options, { headers: this.headers });
        return this.execute(this.http.get(url, options));
    }

    private execute(observable: Observable<Response>): Observable<ResponseModel> {
        return Observable.create((observer) => {
            observable
                .map((response) => response.json())
                .subscribe(
                (data) => observer.next(new ResponseModel(data)),
                (error) => {
                    var json = error.json();
                    if (json.errors && Array.isArray(json.errors))
                        throw new Exception(json.errors
                            .map(_ => new ErrorModel(_.code, _.message, _.level)));
                    else
                        throw new Error(error.text());
                },
                () => { observer.complete(); }
                );
        });
    }
}

export default HttpService;
