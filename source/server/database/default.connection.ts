import {Mongoose}  from "mongoose";

import Connection from "./connection";

const config = require("../common/resources/config/database/database.json");

class DefaultConnection extends Connection {
    constructor() {
        super(config.connection.default);
    }
}

export default DefaultConnection;
