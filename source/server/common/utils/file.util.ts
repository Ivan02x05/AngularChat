import * as Q from "q";
import * as fs from "fs";
import * as path from "path";

import * as fileutil from "../../../common/utils/file.util";
export {fileutil};
import FileIOException from "../exceptions/fileio.exception";

export function exists(p: string): boolean {
    return fs.existsSync(p);
}

export function writeFileFromBase64Url(file: { url: string, path: string, name: string }): Q.Promise<void> {
    var deferred = Q.defer<void>();
    var exec = () => {
        fs.writeFile(path.join(file.path, file.name), fileutil.base64Url_to_base64Data(file.url).data,
            { encoding: "base64" }, (error?: Error) => {
                if (error != null)
                    deferred.reject(new FileIOException(error));
                else
                    deferred.resolve();
            });
    };
    if (exists(file.path))
        exec();
    else
        mkdir(file.path).then(() => exec());

    return deferred.promise;
}

export function readFile(file: { path: string, name: string }): Q.Promise<Buffer> {
    var deferred = Q.defer<Buffer>();
    fs.readFile(path.join(file.path, file.name), (error?: Error, data?: Buffer) => {
        if (error != null)
            deferred.reject(new FileIOException(error));
        else
            deferred.resolve(data);
    });
    return deferred.promise;
}

export function mkdir(p: string): Q.Promise<void> {
    var deferred = Q.defer<void>();
    var exec = () => {
        fs.mkdir(p, (error?: Error) => {
            if (error != null)
                deferred.reject(new FileIOException(error));
            else
                deferred.resolve();
        });
    };
    if (exists(p))
        deferred.resolve();
    else if (exists(path.dirname(p)))
        exec();
    else
        mkdir(path.dirname(p)).then(() => exec());

    return deferred.promise;
}
