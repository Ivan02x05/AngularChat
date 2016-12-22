export function base64Url_to_base64Data(url: string): { type: string, data: string } {
    if (url == null)
        return {
            type: null,
            data: null
        };

    if (!url.match(/^data:.+base64,.+/m))
        return {
            type: null,
            data: url
        };

    const index = url.indexOf(";");
    const type = url.substring("data:".length, index);
    const data = url.substring(index + 1 + "base64,".length);
    return {
        type: type,
        data: data
    };
}

export function encodeCsv(data: any[][]): string {
    if (data == null)
        return null;

    let content = "";
    for (let i = 0; i < data.length; i++) {
        const l = data[i];
        for (let j = 0; j < l.length; j++) {
            const c = l[j];
            if (c != null)
                if (isFinite(c) && typeof (c) != "object")
                    content += c;
                else
                    content += "\"" + c.toString() + "\"";
            if (j < l.length - 1)
                content += ",";
        }
        if (i < data.length - 1)
            content += "\r\n";
    }

    return content;
}
