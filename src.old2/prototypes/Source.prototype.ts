import _ from "lodash";
import { CynClusterManager } from "../cluster/cluster";

declare global {
    interface Source {
        cluster?: CynClusterManager | undefined;

        /**
         * Gets all neighbor positions to this source that are walkable
         */
        getWalkableNeighbors(): RoomPosition[];
    }
}

Object.defineProperties(Source.prototype, {
    cluster: {
        get(this: Source): CynClusterManager | undefined {
            return this.room.cluster;
        },
    },
});

Source.prototype.getWalkableNeighbors = function (
    this: Source
): RoomPosition[] {
    return _.filter(this.pos.neighbors, (pos) => pos.isWalkable(true));
};
