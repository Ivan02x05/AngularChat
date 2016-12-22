export * from "../../../common/utils/string.util";

export const html = {
    escape: (s: string) => {
        if (s == null)
            return s;
        const elem = document.createElement("div");
        elem.appendChild(document.createTextNode(s));
        return elem.innerHTML;
    }
}
