const assert = require('assert');
const { beforeEach, describe, it } = require('mocha');

const { Cache, cacheManager } = require('../lib');

const CACHE_NAME = 'test-cache';

beforeEach(function () {
    this.validateCounter = 0;

    const cache = new Cache({
        name: CACHE_NAME,
        ttlMs: 6000,
        validatorFn: key => {
            return new Promise(resolve => {
                this.validateCounter++;

                setTimeout(() => {
                    resolve(`${key}${Date.now()}`);
                }, Math.round(Math.random() * 1000));
            });
        }
    });
});

describe('Basic functions', function() {
    it('Values can be retreived', async function() {
        this.timeout(3000);

        const cache = cacheManager.get(CACHE_NAME);
        const key1 = 'lorem';
        const key2 = 'ipsum';

        const value1 = await cache.get(key1);
        const value2 = await cache.get(key2);

        assert(value1.startsWith(key1));
        assert(value2.startsWith(key2));
    });

    it('Validator fn is not invoked multiple times', async function () {
        this.timeout(3000);

        const cache = cacheManager.get(CACHE_NAME);
        const key = 'lorem ipsum';

        const values = await Promise.all([
            cache.get(key),
            cache.get(key),
            cache.get(key)
        ]);

        assert(values.length === 3);
        assert(values[ 0 ].startsWith(key));
        values.every(value => value === value[ 0 ]);
        assert(this.validateCounter === 1);
    });
});