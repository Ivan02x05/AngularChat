/// <reference path="../../../typings/tsd.d.ts"/>

import * as Q from "q";

import DataBase from "../database/database";
import BaseBusiness from "./common/base.business";
import SequenceSchema from "../database/schemas/sequence.schema";
import SequenceModel from "../../common/models/impl/common/sequence.model";

class SequenceBusiness extends BaseBusiness {
    public next(name: string): Q.Promise<number> {
        return this.database.model(SequenceSchema)
            .findOneAndUpdate(
            { name: name, "systemColumn.deleteFlag": false },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
            )
            .then(result => result.seq);
    }
}

export default SequenceBusiness;
