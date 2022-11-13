# revalidating-cache

In-memory cache for node.js with a self (re)validating approach. Originally implemented for [SendStreak](https://www.sendstreak.com), but made available to the public.

## Installation

This is a node.js package available through npmjs, so you can install it using the [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```console
$ npm install --save-exact @sendstreak/revalidating-cache
```

## Usage

```js
// Import
const { Cache } = require('@sendstreak/revalidating-cache');

// ...

const userCache = new Cache({
    /**
     * Arbitrary name of your cache. Will be used to retrieve this cache instance
     * from the manager later.
     */
    name: 'USER_CACHE',

    /**
     * Controls wether the cache should store nullish values or not. This is a great way
     * to mitigate DDoS attacks on auth endpoints.
     */
    storeNil: true,

    /**
     * The validity of the entries in the cache in ms.
     */
    ttlMs: 10000,

    /**
     * The validator function that is invoked automatically when we don't have a reference to a cache entry
     * or when it's outdated in there.
     */
    validatorFn: async(key) => {
        /**
         * Here you need to implement the required function to fetch the entry to be cached.
         *
         * This is a vanilla postgres example, but feel free to use your preferred method.
         */
        return (await db.query('select * from users where id = ?', [ key ]))[ 0 ];
    }
});

/**
 * Then either use the reference to the cache you created to get an entry
 * This will return the requested user even if it's not cached yet, as it will
 * invoke the validatorFn to fetch it from the database (if the user exists, of couse).
 */
const user = await userCache.get('ab45d4398');

/**
 * Or use the cache manager to get a reference to your cache first.
 */
const { cacheManager } = require('@sendstreak/revalidating-cache');

const userCache = cacheManager.get('USER_CACHE');
const user = await userCache.get('ab45d4398');
```

