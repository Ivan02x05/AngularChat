import BaseDBModel from "./base.db.model";
import DivisionDocument from "../documents/division.document";

export {DivisionDocument};

export class DivisionDBModel extends BaseDBModel<DivisionDocument> {
}

export default DivisionDBModel;
