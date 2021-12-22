import { DataNode } from './node';
import { parseQuery, SelectQuery, semanticQuery } from './query';

export function selectAll(selector: string, value: unknown): unknown[] {
    const root = new DataNode(value);
    return [...root.select(selector)];
}

export function selectFirst(selector: string, value: unknown): unknown | null {
    const root = new DataNode(value);
    const it = root.select(selector);
    const res = it.next();
    return res.done ? null : res.value;
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
