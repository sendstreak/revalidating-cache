export default interface CacheRecord<T> {
    validUntilMs: number;
    value: T | undefined;
}