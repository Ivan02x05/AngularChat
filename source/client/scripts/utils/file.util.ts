import * as fileutil from "../../../common/utils/file.util";
export {fileutil};

const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);

export function base64Url_to_objectUrl(url: string): string {
    const base64 = fileutil.base64Url_to_base64Data(url);
    return URL.createObjectURL(new Blob([base64_to_binary(base64.data)], { type: base64.type }));
}

export function base64_to_binary(data: string): Uint8Array {
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++)
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

    return URL.createObjectURL(new Blob([BOM, fileutil.encodeCsv(data)], { type: "text/csv" }));
}
