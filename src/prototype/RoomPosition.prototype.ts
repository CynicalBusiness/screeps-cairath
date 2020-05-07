import _ from "lodash";

declare global {
    interface RoomPosition {
        /**
         * Searches a given room in linear range to this position, cached per tick, returning all found objects
         * @param find The find constant to search for
         * @param range The range to search in
         * @param filter A filter for found objects
         */
        searchInLinearRange<
            TFind extends FindConstant,
            TType extends FindTypes[TFind]
        >(
            find: TFind,
            range: number,
            filter?: (obj: FindTypes[TFind]) => obj is TType
        ): TType[];

        /**
         * Searches a given room in linear range to this position, cached per tick, returning the first found object by linear range
         * @param find The find constant to search for
         * @param filter A filter for found objects
         */
        getNearestInLinearRange<
            TFind extends FindConstant,
            TType extends FindTypes[TFind]
        >(
            find: TFind,
            filter?: (obj: FindTypes[TFind]) => obj is TType
        ): TType | undefined;

        room?: Room;
    }
}

Object.defineProperties(RoomPosition.prototype, {
    room: {
        get(this: RoomPosition): Room {
            return Game.rooms[this.roomName];
        },
    },
});

RoomPosition.prototype.searchInLinearRange = function <
    TFind extends FindConstant,
    TType extends FindTypes[TFind]
>(
    this: RoomPosition & {
        _foundInLinear?: { [F in FindConstant]?: _.Dictionary<FindTypes[F][]> };
    },
    find: TFind,
    range: number,
    filter?: (obj: FindTypes[TFind]) => obj is TType
): TType[] {
    this._foundInLinear = this._foundInLinear ?? {};

    const cache = (this._foundInLinear[find] =
        this._foundInLinear[find] ?? {}) as _.Dictionary<FindTypes[TFind][]>;
    const cacheKey = filter ? String(filter) : "";

    return (cache[cacheKey] =
        cache[cacheKey] ??
        this.findInRange(
            find,
            range,
            filter ? { filter } : undefined
        )) as TType[];
};

RoomPosition.prototype.getNearestInLinearRange = function <
    TFind extends FindConstant,
    TType extends FindTypes[TFind]
>(
    this: RoomPosition & {
        _gotInLinear?: { [F in FindConstant]?: _.Dictionary<FindTypes[F][]> };
    },
    find: TFind,
    filter?: (obj: FindTypes[TFind]) => obj is TType
): TType | undefined {
    this._gotInLinear = this._gotInLinear ?? {};

    const cache = (this._gotInLinear[find] =
        this._gotInLinear[find] ?? {}) as _.Dictionary<FindTypes[TFind]>;
    const cacheKey = filter ? String(filter) : "";

    return (cache[cacheKey] =
        cache[cacheKey] ?? this.findClosestByRange(find)) as TType | undefined;
};
