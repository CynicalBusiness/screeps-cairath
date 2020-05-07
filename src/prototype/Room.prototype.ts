import _ from "lodash";

declare global {
    interface Room {
        /**
         * Searches a room, passing the given filter over the objects searched. Note that the filter function may
         * be a type guard for the results
         * @param find The find type
         * @param filter The filter to use, if any
         * @see Room#find
         */
        search<TFind extends FindConstant, TType extends FindTypes[TFind]>(
            find: TFind,
            filter?: (obj: FindTypes[TFind]) => obj is TType
        ): TType[];
    }
}

Room.prototype.search = function <
    TFind extends FindConstant,
    TType extends FindTypes[TFind]
>(
    this: Room & {
        _found?: { [F in FindConstant]?: _.Dictionary<FindTypes[F][]> };
    },
    find: TFind,
    filter?: (obj: FindTypes[TFind]) => obj is TType
): TType[] {
    this._found = this._found ?? {};

    const cache = (this._found[find] = this._found[find] ?? {}) as _.Dictionary<
        FindTypes[TFind][]
    >;
    const cacheKey = filter ? String(filter) : "";

    const found = (cache[cacheKey] =
        cache[cacheKey] ??
        cache[""] ??
        this.find(find, filter ? { filter } : undefined));
    return found as TType[];
};
