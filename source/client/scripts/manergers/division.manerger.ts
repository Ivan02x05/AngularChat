import {Injectable} from  "angular2/core";
import * as rxjs from "rxjs/Rx";

import DivisionService from "../services/division.http.service";
import DivisionModel from "../../../common/models/impl/common/division.model";

@Injectable()
class DivisionManerger {
    private observable: rxjs.Observable<DivisionManerger>;
    private divisions: Map<string, Map<string, DivisionModel>> =
    new Map<string, Map<string, DivisionModel>>();

    constructor(service: DivisionService) {
        this.observable = rxjs.Observable.create((observer) => {
            service.list()
                .map((response) => <DivisionModel[]>response.models.divisions)
                .subscribe(
                (divisions) => {
                    divisions.map(_ => {
                        if (!this.divisions.has(_.code))
                            this.divisions.set(_.code, new Map<string, DivisionModel>());

                        this.divisions.get(_.code).set(_.subcode, new DivisionModel(_));
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

    public getDivision(code: string, subcode: string): DivisionModel {
        if (this.divisions.has(code)
            && this.divisions.get(code).has(subcode))
            return this.divisions.get(code).get(subcode);
        else
            return null;
    }

    public getValue(code: string, subcode: string): string {
        var division = this.getDivision(code, subcode);
        if (division != null)
            return division.value;
        else
            return null;
    }

    public getDivisions(code: string): DivisionModel[] {
        var divisions: DivisionModel[] = [];
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
