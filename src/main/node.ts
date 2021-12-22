import { parseSelector, Selector, SelectorToken } from './selector';

export interface MatchResult {
    node: DataNode;
    value: unknown;
}

export class DataNode {

    constructor(
        readonly value: unknown,
        readonly key: string = '',
        readonly parent: DataNode | null = null,
    ) {

    }

    ancestors(): DataNode[] {
        return this.parent ? this.parent.ancestors().concat(this) : [this];
    }

    path(): string[] {
        return this.parent ? this.parent.path().concat(this.key) : [this.key];
    }

    *children(): IterableIterator<DataNode> {
        if (this.value && typeof this.value === 'object') {
            for (const [k, v] of Object.entries(this.value)) {
                yield new DataNode(v, k, this);
            }
        }
    }

    *descendants(): IterableIterator<DataNode> {
        yield this;
        for (const child of this.children()) {
            yield* child.descendants();
        }
    }

    *select(selector: string | Selector): IterableIterator<MatchResult> {
        if (typeof selector === 'string') {
            yield* this.select(parseSelector(selector));
            return;
        }
        for (const node of this.descendants()) {
            const match = node.match(selector);
            if (match) {
                yield match;
            }
        }
    }

    match(selector: string | Selector): MatchResult | null {
        if (typeof selector === 'string') {
            return this.match(parseSelector(selector));
        }
        const remainingNodes = this.ancestors();
        const remainingTokens = selector.tokens.slice();
        nextToken: while (remainingTokens.length) {
            const tok = remainingTokens.shift()!;
            nextNode: while (remainingNodes.length) {
                const node = remainingNodes.shift()!;
                const match = node.matchToken(tok);
                if (match) {
                    continue nextToken;
                }
                if (tok.deep) {
                    continue nextNode;
                }
                return null;
            }
            return null;
        }
        if (remainingNodes.length !== 0) {
            return null;
        }
        return {
            node: this,
            value: selector.selectKey ? this.key : this.value,
        };
    }

    protected matchToken(token: SelectorToken) {
        const matchKey = token.key === '*' || token.key === this.key;
        if (!matchKey) {
            return false;
        }
        return true;
    }

}
