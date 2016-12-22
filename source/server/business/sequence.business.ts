import * as Q from "q";

import DataBase from "../database/database";
import BaseBusiness from "./common/base.business";
import SequenceSchema from "../database/schemas/sequence.schema";
import SequenceIOModel from "../../common/models/io/common/sequence.io.model";

class SequenceBusiness extends BaseBusiness {
    public next(name: string): Q.Promise<string> {
        return this.database.model(SequenceSchema)
            .findOneAndUpdate(
            { name: name, "systemColumn.deleteFlag": false },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
            )
            .then(result => result.seq.toString());
    }
}

export default SequenceBusiness;
