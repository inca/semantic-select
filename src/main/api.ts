import { DataNode } from './node';
import { parseQuery, SelectQuery, semanticQuery } from './query';

export function selectAll(selector: string, value: unknown): unknown[] {
    const root = new DataNode(value);
    const results: unknown[] = [];
    for (const match of root.select(selector)) {
        results.push(match.value);
    }
    return results;
}

export function selectFirst(selector: string, value: unknown): unknown | null {
    const root = new DataNode(value);
    const it = root.select(selector);
    const res = it.next();
    return res.done ? null : res.value.value;
}

export function contains(selector: string, value: unknown) {
    const root = new DataNode(value);
    const it = root.select(selector);
    const res = it.next();
    return !res.done;
}

export function semanticSelect(query: SelectQuery, value: unknown) {
    const node = new DataNode(value);
    const parsedQuery = parseQuery(query);
    return semanticQuery(parsedQuery, node);
}
