import _ from "lodash";

declare global {
    interface RoomPosition {
        _neighbors?: RoomPosition[];

        /** The room this room position belongs to */
        room: Room;

        /** Neighbors to this room */
        neighbors: RoomPosition[];

        /**
         * Whether or not this position matches the given terrain mask
         * @param terrainMask The terrain mask
         * */
        is(terrainMask: number): boolean;

        /**
         * Whether or not this position is walkable
         * @param considerStructures Whether or not to consider structures when checking
         */
        isWalkable(considerStructures?: boolean): boolean;

        /**
         * Whether or not this room position is within bounds
         */
        inBounds(): boolean;

        toString(): string;
    }
}

Object.defineProperties(RoomPosition.prototype, {
    neighbors: {
        get(this: RoomPosition): RoomPosition[] {
            if (!this._neighbors)
                this._neighbors = _.chain([
                    [-1, -1],
                    [-1, 0],
                    [-1, 1],
                    [0, -1],
                    [0, 1],
                    [1, -1],
                    [1, 0],
                    [1, 1],
                ])
                    .map(([x, y]) =>
                        this.room.getPositionAt(x + this.x, y + this.y)
                    )
                    .filter(
                        (pos): pos is RoomPosition => !!pos && pos.inBounds()
                    )
                    .value();
            return this._neighbors;
        },
    },
    room: {
        get(this: RoomPosition): Room {
            return Game.rooms[this.roomName];
        },
    },
});

RoomPosition.prototype.inBounds = function (this: RoomPosition) {
    return (
        !!this.room && this.x >= 0 && this.y >= 0 && this.x < 50 && this.y < 50
    );
};

RoomPosition.prototype.is = function (
    this: RoomPosition,
    terrainMask: number
): boolean {
    const terrain = this.room.getTerrain().get(this.x, this.y);
    return this.inBounds() && terrainMask === 0
        ? terrain === 0
        : (terrain & terrainMask) > 0;
};

RoomPosition.prototype.isWalkable = function (
    this: RoomPosition,
    considerStructures = false
): boolean {
    const isWalkableTerrain = this.is(0) || this.is(TERRAIN_MASK_SWAMP);
    if (considerStructures) {
        // TODO
        return isWalkableTerrain;
    } else return isWalkableTerrain;
};

RoomPosition.prototype.toString = function (this: RoomPosition) {
    return `${this.roomName}@${this.x},${this.y}`;
};
