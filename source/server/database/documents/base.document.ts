import {Document}  from "mongoose";
import IBaseModel from "../../../common/models/if/common/base.model.interface";
import DataBase from "../database";
import BaseDBModel from "../models/base.db.model";

interface BaseDocument extends IBaseModel, Document {
    dbmodel: BaseDBModel<BaseDocument>;
}

export default BaseDocument;
