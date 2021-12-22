import assert from 'assert';
import { readFileSync } from 'fs';
import path from 'path';
import Yaml from 'yaml';

import { semanticSelect } from '../main/api';

const data = Yaml.parse(readFileSync(path.join(process.cwd(), 'src/test/data.yaml'), 'utf8'));

describe('semanticSelect', () => {

    it('works', () => {
        const results = semanticSelect({
            selector: 'items categories > * > *',
            fields: {
                itemName: 'items name',
                storeName: 'stores > * > name',
                storeAddress: 'address',
                category: 'categories > *:key',
                price: 'price value',
                oldPrice: 'oldPrice value',
                sellers: 'staff > * > name',
            }
        }, data);
        assert.deepStrictEqual(results, [
            {
                storeName: 'Book Store',
                storeAddress: { country: 'GB', city: 'London', street: '82 Kingsway' },
                category: 'SALE',
                itemName: 'Mystery Book',
                price: 20,
                oldPrice: 40,
                sellers: 'Jenny'
            },
            {
                storeName: 'Book Store',
                storeAddress: { country: 'GB', city: 'London', street: '82 Kingsway' },
                category: 'SALE',
                itemName: 'Revelation Book',
                price: 30,
                oldPrice: 50,
                sellers: 'Jenny'
            },
            {
                storeName: 'Book Store',
                storeAddress: { country: 'GB', city: 'London', street: '82 Kingsway' },
                category: 'NEW',
                itemName: 'Surprise Book',
                price: 100,
                sellers: 'Jenny'
            },
            {
                storeName: 'Coffee Shop',
                category: 'STANDARD',
                itemName: 'Espresso',
                price: 3,
                sellers: 'Susan'
            },
            {
                storeName: 'Coffee Shop',
                category: 'STANDARD',
                itemName: 'Flat White',
                price: 3.2,
                sellers: 'Susan'
            },
            {
                storeName: 'Coffee Shop',
                category: 'STANDARD',
                itemName: 'Capuccino',
                price: 4.2,
                sellers: 'Susan'
            }
        ]);
    });

});
