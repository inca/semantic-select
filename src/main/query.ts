import { DataNode } from './node';
import { parseSelector, Selector } from './selector';
import { findCommonPrefix } from './util';

export interface SelectQuery {
    selector: string;
    fields: {
        [key: string]: string;
    }
}

export interface ParsedSelectQuery {
    selector: Selector;
    fields: {
        [key: string]: Selector;
    }
}

export function parseQuery(query: SelectQuery): ParsedSelectQuery {
    const result: ParsedSelectQuery = {
        selector: parseSelector(query.selector),
        fields: {},
    };
    for (const [k, v] of Object.entries(query.fields ?? {})) {
        result.fields[k] = parseSelector(v);
    }
    return result;
}

export function semanticQuery(query: ParsedSelectQuery, root: DataNode) {
    const entries: QueryEntry[] = [];
    const fields: QueryField[] = [];
    for (const node of root.descendants()) {
        if (node.match(query.selector)) {
            entries.push({
                path: node.path(),
                fields: new Map(),
            });
        }
        for (const [key, sel] of Object.entries(query.fields)) {
            // TODO think about accumulating arrays
            const value = sel.selectKey ? node.key : node.value;
            if (node.match(sel)) {
                fields.push({
                    key,
                    path: node.path(),
                    value,
                });
            }
        }
    }
    return processEntries(entries, fields);
}

function processEntries(entries: QueryEntry[], fields: QueryField[]) {
    const fieldRanks = new Map<string, number>();
    // First we assign fields to entries and calculate field ranks
    for (const entry of entries) {
        for (const field of fields) {
            const commonPrefix = findCommonPrefix(entry.path, field.path);
            const existingField = entry.fields.get(field.key);
            const oldRank = existingField?.rank ?? 0;
            const newRank = commonPrefix.length;
            if (newRank > oldRank) {
                entry.fields.set(field.key, {
                    value: field.value,
                    rank: commonPrefix.length,
                });
            }
            fieldRanks.set(field.key, Math.max(oldRank, newRank, fieldRanks.get(field.key) ?? 0));
        }
    }
    // Now we create the result objects out of entries by only keeping highest-rank fields
    return entries.map(entry => {
        const result: any = {};
        for (const [key, field] of entry.fields) {
            if (fieldRanks.get(key) === field.rank) {
                result[key] = field.value;
            }
        }
        return result;
    });
}

interface QueryField {
    key: string;
    path: string[];
    value: unknown;
}

interface QueryEntry {
    path: string[];
    fields: Map<string, QueryEntryField>;
}

interface QueryEntryField {
    value: unknown;
    rank: number;
}
