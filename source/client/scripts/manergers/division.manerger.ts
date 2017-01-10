import {Injectable} from  "angular2/core";
import {Observable} from "rxjs/Rx";

import DivisionService from "../services/division.http.service";
import DivisionIOModel from "../../../common/models/io/common/division.io.model";

@Injectable()
class DivisionManerger {
    private service: DivisionService;
    private divisions: Map<string, Map<string, DivisionIOModel>> =
    new Map<string, Map<string, DivisionIOModel>>();

    constructor(service: DivisionService) {
        this.service = service;
    }

    public initialize(): Observable<DivisionManerger> {
        return this.service.list()
            .map(response => response.models.divisions
                .map(_ => new DivisionIOModel(_)))
            .flatMap(divisions => {
                divisions.forEach(_ => {
                    if (!this.divisions.has(_.code))
                        this.divisions.set(_.code, new Map<string, DivisionIOModel>());

                    this.divisions.get(_.code).set(_.subcode, _);
                });
                return Observable.of(this);
            });
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
