import * as fileutil from "../../../common/utils/file.util";
export {fileutil};

export function base64Url_to_objectUrl(url: string): string {
    var base64 = fileutil.base64Url_to_base64Data(url);
    return URL.createObjectURL(new Blob([base64_to_binary(base64.data)], { type: base64.type }));
}

export function base64_to_binary(data: string): Uint8Array {
    var binary = atob(data);
    var array = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++)
        array[i] = binary.charCodeAt(i);

    return array;
}

export function deleteObjectUrl(url: string) {
    if (!url.startsWith("blob:"))
        return;
    URL.revokeObjectURL(url);
}

export function createCsvFile(data: any[][]): string {
    if (data == null)
        return null;

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    return URL.createObjectURL(new Blob([bom, fileutil.encodeCsv(data)], { type: "text/csv" }));
}
