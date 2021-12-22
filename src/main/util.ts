export function findCommonPrefix(a: string[], b: string[]): string[] {
    const result: string[] = [];
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) {
            result.push(a[i]);
        } else {
            break;
        }
    }
    return result;
}
