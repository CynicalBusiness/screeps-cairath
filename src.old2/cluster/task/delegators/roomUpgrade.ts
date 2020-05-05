import _ from "lodash";
import { Priority } from "../../../const";
import { TaskDelegator } from "../delegator";

export class RoomUpgradeTaskDelegator extends TaskDelegator<
    CynCluster.Task.Object.UpgradeRoomController
> {
    public findWork(): CynCluster.Task.Object.UpgradeRoomController[] {
        return _.map(
            this.cluster.rooms,
            (room): CynCluster.Task.Object.UpgradeRoomController => ({
                type: "UpgradeRoomController",
                allowMultipleWorkers: true,
                room: room.name,
                priority:
                    room.controller && room.controller.ticksToDowngrade < 10000
                        ? Priority.HIGH
                        : Priority.LOW,
            })
        );
    }
}
