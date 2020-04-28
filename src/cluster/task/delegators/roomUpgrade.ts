import _ from "lodash";
import { TaskDelegator, TaskPriority } from "../delegator";

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
                        ? TaskPriority.HIGH
                        : TaskPriority.LOW,
            })
        );
    }
}
