import CacheConfig from './CacheConfig';
import CacheRecord from './CacheRecord';
import cacheManager from './cacheManager';

/**
 * Class that represents a key-value based in-memory cache that automatically (re)validates itself
 * when there is 
 */
export default class Cache<T> {
    private readonly cacheRecords: Record<string, CacheRecord<T>> = {};
    private readonly validationsInFlight: Record<string, Promise<T | undefined>> = {};

    public constructor(private readonly cacheConfig: CacheConfig<T>) {
        cacheManager.set(this.cacheConfig.name, this);
    }

    /**
     * Disposes the cache.
     */
    public dispose(): void {
        // First we remove the references to the in-flight requests, if any.
        for (let key of Object.keys(this.validationsInFlight)) {
            delete this.validationsInFlight[ key ];
        }

        // Then remove all the objects
        for (let key of Object.keys(this.cacheRecords)) {
            delete this.cacheRecords[ key ];
        }

        // Then remove the cache from the manager
        cacheManager.set(this.cacheConfig.name, undefined);
    }

    /**
     * Retrieves an entry rom the cache. If the cache doesn't contain the entry, it tries
     * to fetch it using the provided `validatorFn` and then automatically caches it.
     *
     * @param key The key of the entry to be retrieved.
     * @param forceValidation If `true`, the entry will be revalidated forcefully before it is returned. Defaults to `false`.
     * @returns T
     */
    public async get(key: string, forceValidation = false): Promise<T | undefined> {
        let cacheRecord = this.cacheRecords[ key ];
        const now = Date.now();

        if (forceValidation === true || cacheRecord === undefined || now > cacheRecord.validUntilMs) {
            delete this.cacheRecords[ key ];

            let validationInFlight = this.validationsInFlight[ key ];

            if (validationInFlight === undefined) {
                cacheRecord = await this.validate(key);
            } else {
                await validationInFlight;

                cacheRecord = this.cacheRecords[ key ];
            }

            return cacheRecord.value;
        }

        return cacheRecord.value;
    }

    /**
     * Removes (unsets) an entry in the cache.
     *
     * @param key The key of the entry to be removed.
     */
    public invalidate(key: string): void {
        delete this.cacheRecords[ key ];
    }

    private async validate(key: string): Promise<CacheRecord<T>> {
        const validationInFlight = this.cacheConfig.validatorFn(key);
        this.validationsInFlight[ key ] = validationInFlight;

        const cacheRecord = {
            validUntilMs: Date.now() + this.cacheConfig.ttlMs,
            value: await validationInFlight ?? undefined
        };

        if (
            /**
             * This reference may be missing at this point, if the cache has been
             * invalidated meanwhile. In this case we don't store the entry to
             * avoid leak.
             */
            this.validationsInFlight[ key ] !== undefined
            && (
                this.cacheConfig.storeNil
                || (cacheRecord.value !== undefined && cacheRecord.value !== null)
            )
        ) {
            this.cacheRecords[ key ] = cacheRecord;
        }

        delete this.validationsInFlight[ key ];

        return cacheRecord;
    }
}
