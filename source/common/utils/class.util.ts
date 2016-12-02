export function getClassName(target: Object): string {
    if (target == null || target.constructor == null)
        return null;

    return /(\w+)\(/.exec(target.constructor.toString())[1];
}
