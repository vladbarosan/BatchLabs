import { DataCache } from "./data-cache";

export interface TargetedDataCacheOptions<TParams> {
    /**
     * Function that returns the key for
     */
    key?: (params: TParams) => string;
}

const defaultOptions: TargetedDataCacheOptions<any> = {
    key: (params) => JSON.stringify(params),
};

export class TargetedDataCache<TParams, TEntity> {
    private _caches = new Map<string, DataCache<TEntity>>();
    private _options: TargetedDataCacheOptions<TParams>;

    constructor(options: TargetedDataCacheOptions<TParams> = {}) {
        this._options = Object.assign({}, defaultOptions, options);
    }

    /**
     * Return the key of the cache associated to the given params
     */
    public getCacheKey(params: TParams) {
        return this._options.key(params);
    }

    public getCache(params: TParams): DataCache<TEntity> {
        const key = this.getCacheKey(params);
        let cache = this._caches.get(key);
        if (!cache) {
            cache = new DataCache<TEntity>();
            this._caches.set(key, cache);
        }
        return cache;
    }

    public deleteCache(params: TParams) {
        const key = this.getCacheKey(params);
        this._caches.delete(key);
    }
}
