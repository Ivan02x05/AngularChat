export function toYyyymmdd(d: Date | string): Date {
    if (d == null)
        return null;

    if (!(d instanceof Date))
        d = new Date(<string>d);

    return new Date(
        (<Date>d).getFullYear(),
        (<Date>d).getMonth(),
        (<Date>d).getDate()
    );
}

export function equals(d1: Date, d2: Date): boolean {
    return d1.valueOf() == d2.valueOf();
}

export function addDate(d: Date, days: number): Date {
    const clone = new Date(d.valueOf());
    clone.setDate(clone.getDate() + days);
    return clone;
}
