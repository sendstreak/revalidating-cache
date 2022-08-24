import Cache from './Cache';

class CacheManager {
    private readonly caches: Record<string, Cache<unknown> | undefined> = {};

    /**
     * Disposes all the caches managed by this manager.
     */
     public dispose(): void {
        // We dispose all the caches. This will remove the references too.
        for (let [ key, cache ] of Object.entries(this.caches)) {
            cache?.dispose();
        }
    }

    /**
     * Retrieves a managed instance by name, if exists.
     *
     * @param name The name of the cache to retrieve.
     * @returns Cache<T> or undefined
     */
    public get<T>(name: string): Cache<T> | undefined {
        return this.caches[ name ] as Cache<T>;
    }

    /**
     * Sets or updates a managed cache instance in the manager.
     *
     * @param name The name of the cache to set.
     * @param cache The cache instance (or undefined) to set.
     */
    public set(name: string, cache: Cache<unknown> | undefined): void {
        this.caches[ name ] = cache;
    }
}

export default new CacheManager();
