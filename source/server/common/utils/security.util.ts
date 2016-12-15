

import * as crypto from "crypto";

var config = require("../resources/config/security/security.json");

export function encryption(value: string): string {
    if (value == null)
        return null;

    var cipher: crypto.Cipher = crypto
        .createCipher(config.algorithm, config.secret_key);

    cipher.update(value, config.input_encoding, config.output_encoding);
    return cipher.final(config.output_encoding);
}

export function decryption(value: string): string {
    if (value == null)
        return null;

    var decipher: crypto.Decipher = crypto
        .createDecipher(config.algorithm, config.secret_key);

    decipher.update(value, config.output_encoding, config.input_encoding);
    return decipher.final(config.input_encoding);
}
