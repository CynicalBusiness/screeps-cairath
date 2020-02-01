import _ from "lodash";

export function createOnlyOwnStructuresFilter(
    additionalFilter?: FilterFunction<FIND_STRUCTURES>
): FilterOptions<FIND_STRUCTURES> {
    return {
        filter: s =>
            isOwnStructure(s) && (!additionalFilter || additionalFilter(s))
    };
}

export function isOwnStructure(struct: AnyStructure): boolean {
    if (struct instanceof OwnedStructure) {
        return struct.my;
    } else {
        return !!struct.room.controller?.my;
    }
}

/** Gets the home room for creeps to fall back to if needed */
export function getHomeRoom(): Room {
    return Game.rooms[Memory.homeRoom];
}

/**
 * Gets rooms neighboring the given position
 * @param pos The position
 */
export function getNeighbors(pos: RoomPosition): RoomPosition[] {
    const room = Game.rooms[pos.roomName];
    return _.map(
        [
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 0],
            [1, 1],
            [1, 2],
            [2, 0],
            [2, 1],
            [2, 2]
        ],
        ([x, y]) => room.getPositionAt(x, y)
    ).filter(p => !!p) as RoomPosition[];
}
