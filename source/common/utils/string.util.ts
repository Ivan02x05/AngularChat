export const regexp = {
    escape: (s: string) => {
        if (s == null)
            return s;
        return s.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
    }
};

export function lpad(value: string, char: string, count: number): string {
    if (value == null)
        return null;

    return (Array(count).join(char) + value).slice(value.length - 1);
}
