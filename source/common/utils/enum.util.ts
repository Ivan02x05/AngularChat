export function getValues<T>(e: T): number[] {
    return Object.keys(e)
        .map(v => parseInt(v, 10))
        .filter(v => !isNaN(v));
}

export function getNames<T>(e: T): string[] {
    return Object.keys(e)
        .filter(v => !isNaN(parseInt(v, 10)));
}
