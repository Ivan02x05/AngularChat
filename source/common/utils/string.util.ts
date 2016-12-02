export var regexp = {
    escape: (s: string) => {
        if (s == null)
            return s;
        return s.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
    }
};
