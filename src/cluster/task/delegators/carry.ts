import _ from "lodash";
import { TaskDelegator, TaskPriority } from "../delegator";

export class CarryTaskDelegator extends TaskDelegator<
    CynCluster.Creep.RoleTasks["Courier"]
> {
    public findWork(): CynCluster.Creep.RoleTasks["Courier"][] {
        return _.chain(this.cluster.rooms)
            .flatMap((room) => room.find(FIND_DROPPED_RESOURCES))
            .map(
                (res): CynCluster.Task.Object.PickupPosition => ({
                    type: "PickupPosition",
                    priority: TaskPriority.HIGH,
                    from: res.id,
                    resource: res.resourceType,
                })
            )
            .value();

        // TODO other carry tasks
    }
}
