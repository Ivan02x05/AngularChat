import {Injectable} from  "angular2/core";
import * as rxjs from "rxjs/Rx";

import DivisionService from "../services/division.http.service";
import DivisionIOModel from "../../../common/models/io/common/division.io.model";

@Injectable()
class DivisionManerger {
    private observable: rxjs.Observable<DivisionManerger>;
    private divisions: Map<string, Map<string, DivisionIOModel>> =
    new Map<string, Map<string, DivisionIOModel>>();

    constructor(service: DivisionService) {
        this.observable = rxjs.Observable.create((observer) => {
            service.list()
                .map((response) => <DivisionIOModel[]>response.models.divisions)
                .subscribe(
                (divisions) => {
                    divisions.map(_ => {
                        if (!this.divisions.has(_.code))
                            this.divisions.set(_.code, new Map<string, DivisionIOModel>());

                        this.divisions.get(_.code).set(_.subcode, new DivisionIOModel(_));
                    });
                    observer.next(this);
                    observer.complete();
                }
                );
        });
    }

    public initialize() {
        return this.observable;
    }

    public getDivision(code: string, subcode: string): DivisionIOModel {
        if (this.divisions.has(code)
            && this.divisions.get(code).has(subcode))
            return this.divisions.get(code).get(subcode);
        else
            return null;
    }

    public getValue(code: string, subcode: string): string {
        const division = this.getDivision(code, subcode);
        if (division != null)
            return division.value;
        else
            return null;
    }

    public getDivisions(code: string): DivisionIOModel[] {
        const divisions: DivisionIOModel[] = [];
        if (this.divisions.has(code)) {
            this.divisions.get(code)
                .forEach(v => {
                    divisions.push(v);
                });
        }
        return divisions;
    }
}

export default DivisionManerger;
