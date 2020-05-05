import { CacheType } from "../const";

export const runtimeCache = {};

export type CacheOptions<TType> = {
    /** A function that is called on each access determining whether to update the cache */
    isDirty?: (val: TType) => boolean;

    /** Argument for `this` in the inner function */
    thisArg?: any;

    /** A caching key prefix. This can be an empty string, but could potentially have problems in that case */
    key: string | symbol;
} & (
    | {
          /** The type of caching */
          type: CacheType.OBJECT;

          /** The target object to cache on */
          target: any;
      }
    | {
          /** The type of caching */
          type: Exclude<CacheType, CacheType.OBJECT>;
      }
);

/**
 * Caches the result of the provided function using the given {@link CacheType}
 * @param originalFunction The original function to cache
 * @param options Options for caching
 */
export function cache<TFunc extends (this: any, ...args: any) => any>(
    originalFunction: TFunc,
    { isDirty, thisArg, key, ...options }: CacheOptions<ReturnType<TFunc>>
): TFunc {
    let cacheObject: _.Dictionary<ReturnType<TFunc>>;
    switch (options.type) {
        case CacheType.OBJECT:
            if (options.target._cache === undefined)
                Object.defineProperty(options.target, "_cache", {
                    enumerable: false,
                    value: {},
                });
            cacheObject = options.target._cache;
            break;
        case CacheType.MEMORY:
            cacheObject = Memory._cache = Memory._cache ?? {};
            break;
        case CacheType.RUNTIME:
            cacheObject = runtimeCache;
            break;
    }

    return function (this: ThisParameterType<TFunc>, ...args) {
        const cacheKey = key.toString() + JSON.stringify(args);

        const cached = cacheObject[cacheKey];
        if (!cached || !(isDirty && isDirty(cached))) {
            cacheObject[cacheKey] = originalFunction.apply(
                thisArg ?? this,
                args
            );
        }

        return cacheObject[cacheKey];
    } as TFunc;
}

export function cacheThis<TFunc extends (this: any, ...args: any) => any>(
    type: CacheType,
    key: string | symbol,
    originalFunction: TFunc,
    isDirty?: (val: any) => boolean
): TFunc {
    return function (...args) {
        return cache(originalFunction, {
            isDirty,
            type,
            key,
            target: this,
        }).apply(this, args);
    } as TFunc;
}

/**
 * This decorator causes a function to be cached in one of a few places, such that each time the function is called, the
 * result is only evaluated if the cache is not available or has been marked dirty.
 * @param type The type of caching to be done
 * @param isDirty A function that is called on each access determining whether to update the cache
 */
export function cached(type: CacheType, isDirty?: (val: any) => boolean) {
    return (
        target: any,
        key: string | symbol,
        descriptor: PropertyDescriptor
    ) => {
        if (descriptor.value) {
            descriptor.value = cache(descriptor.value, {
                type,
                target,
                key,
                thisArg: target,
                isDirty,
            });
        }
    };
}
