export * from "../../../common/utils/string.util";

export var html = {
    escape: (s: string) => {
        if (s == null)
            return s;
        var elem = document.createElement("div");
        elem.appendChild(document.createTextNode(s));
        return elem.innerHTML;
    }
}
