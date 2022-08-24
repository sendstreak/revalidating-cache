export default interface CacheConfig<T> {
    name: string;
    storeNil?: boolean;
    ttlMs: number;
    validatorFn: (key: string) => Promise<T | undefined>;
}