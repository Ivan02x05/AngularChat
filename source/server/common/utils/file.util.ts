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
    const exec = (): Q.Promise<void> => {
        return Q.nfcall<void>(fs.writeFile, path.join(file.path, file.name), fileutil
            .base64Url_to_base64Data(file.url).data, { encoding: "base64" })
            .catch(error => Q.reject<void>(new FileIOException(error)));
    };
    return Q.fcall(exists, file.path)
        .then<void>(flag => {
            if (flag)
                return exec();
            else
                return mkdir(file.path)
                    .then(() => exec());
        });
}

export function readFile(file: { path: string, name: string }): Q.Promise<Buffer> {
    return Q.nfcall<Buffer>(fs.readFile, path.join(file.path, file.name))
        .catch(error => Q.reject<Buffer>(new FileIOException(error)));
}

export function mkdir(p: string): Q.Promise<void> {
    const exec = (): Q.Promise<void> => {
        return Q.nfcall<void>(fs.mkdir, p)
            .catch(error => Q.reject<void>(new FileIOException(error)));
    };
    return Q.all(
        [
            Q.fcall(exists, p),
            Q.fcall(exists, path.dirname(p)),
        ]
    ).spread((p1, p2) => {
        if (p1)
            return;
        else if (p2)
            return exec();
        else
            return mkdir(path.dirname(p))
                .then(() => exec());
    });
}

export function mkdirSync(p: string) {
    if (exists(p))
        return;
    else if (exists(path.dirname(p)))
        fs.mkdirSync(p)
    else
        mkdirSync(path.dirname(p))
}

export function readdirSync(path: string): string[] {
    return fs.readdirSync(path);
}

export function writeFile(file: { path: string, name: string, data: any }): Q.Promise<void> {
    const exec = (): Q.Promise<void> => {
        return Q.nfcall<void>(fs.writeFile, path.join(file.path, file.name), file.data)
            .catch(error => Q.reject<void>(new FileIOException(error)));
    };
    return mkdir(file.path)
        .then(() => exec());
}
