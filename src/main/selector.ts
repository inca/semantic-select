export interface Selector {
    tokens: SelectorToken[];
    selectKey: boolean;
}

export interface SelectorToken {
    key: string;
    deep: boolean;
}

export function parseSelector(str: string): Selector {
    const tokens: SelectorToken[] = [];
    let selectKey = false;
    let deep = true;
    str = str.replace(/(:key)\s*$/g, () => {
        selectKey = true;
        return '';
    }).trim();
    for (const token of str.split(/\s+/g)) {
        if (token === '>') {
            deep = false;
            continue;
        }
        tokens.push({
            key: token,
            deep,
        });
        deep = true;
    }
    return { tokens, selectKey };
}
