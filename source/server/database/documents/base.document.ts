/// <reference path="../../../../typings/tsd.d.ts"/>

import {Document}  from "mongoose";
import IBaseModel from "../../../common/models/common/base.model.interface";
import DataBase from "../database";
import BaseModel from "../models/base.model";

interface BaseDocument extends IBaseModel, Document {
    creator: BaseModel<BaseDocument>;
}

export default BaseDocument;
