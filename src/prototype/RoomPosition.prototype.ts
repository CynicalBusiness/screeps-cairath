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

        /**
         * Gets all relative position offsets within a given range. Note that some offsets may be outside the room.
         * @param range The range to get offsets in; defaults to `1`.
         */
        getNeighborOffsets(range?: number): [number, number][];

        /**
         * Gets all neighbors to this room position within a given range, discounting those that are out-of-bounds
         * @param range The range to get offsets in; defaults to `1`.
         */
        getNeighbors(range?: number): RoomPosition[];

        /**
         * Gets all neighbors that are walkable. Returns tiles which are not occupied by a non-walkable structure (if
         * `considerStructures`) or walls. Roads on walls are considered walkable only if `considerStructures`
         * @param considerStructures Whether or not to consider structures
         */
        getWalkableNeighbors(considerStructures?: boolean): RoomPosition[];

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

RoomPosition.prototype.getNeighborOffsets = function (
    this: RoomPosition,
    range = 1
): [number, number][] {
    const neighbors: [number, number][] = [];
    for (let x = -range; x <= range; x++) {
        for (let y = -range; y <= range; y++) {
            if (x === 0 && y === 0) continue;
            neighbors.push([x, y]);
        }
    }
    return neighbors;
};

RoomPosition.prototype.getNeighbors = function (
    this: RoomPosition & { _neighbors: _.NumericDictionary<RoomPosition[]> },
    range = 1
): RoomPosition[] {
    if (!this.room) return [];
    this._neighbors = this._neighbors ?? {};
    return (this._neighbors[range] =
        this._neighbors[range] ??
        _(this.getNeighborOffsets(range))
            .map(([x, y]) => this.room?.getPositionAt(x + this.x, y + this.y))
            .compact()
            .value());
};

RoomPosition.prototype.getWalkableNeighbors = function (
    this: RoomPosition & {
        _walkableNeighbors: { with?: RoomPosition[]; without?: RoomPosition[] };
    },
    considerStructures?: boolean
): RoomPosition[] {
    this._walkableNeighbors = this._walkableNeighbors ?? {};
    const wwo = considerStructures ? "with" : "without";
    return (this._walkableNeighbors[wwo] =
        this._walkableNeighbors[wwo] ??
        _.filter(this.getNeighbors(), (neighbor) => {
            const walkableTerrain =
                neighbor.lookFor(LOOK_TERRAIN)[0] !== "wall";

            if (considerStructures) {
                // TODO implement this
                return walkableTerrain;
            } else return walkableTerrain;
        }));
};
