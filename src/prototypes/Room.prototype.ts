import _ from "lodash";
import { CynClusterManager } from "../cluster/cluster";

declare global {
    interface Room {
        cluster?: CynClusterManager;

        /**
         * Finds a parking flag in a given room
         */
        findParkingFlag(): Flag | undefined;
    }
}

Object.defineProperties(Room.prototype, {
    cluster: {
        get(this: Room): CynClusterManager | undefined {
            return GameCore.getClusterForRoom(this.name);
        },
    },
});

Room.prototype.findParkingFlag = function (this: Room): Flag | undefined {
    return _.chain(this.find(FIND_FLAGS))
        .filter((flag) => flag.name.startsWith("Parking"))
        .first()
        .value();
};
