import _ from "lodash";
import { TaskDelegator, TaskPriority } from "../delegator";

export class CarryTaskDelegator extends TaskDelegator<
    CynCluster.Creep.RoleTasks["Courier"]
> {
    public findWork(): CynCluster.Creep.RoleTasks["Courier"][] {
        return [
            ..._.chain(this.cluster.rooms)
                .flatMap((room) => room.find(FIND_DROPPED_RESOURCES))
                .map(
                    (res): CynCluster.Task.Object.PickupPosition => ({
                        type: "PickupPosition",
                        priority: TaskPriority.HIGH,
                        from: res.id,
                        resource: res.resourceType,
                    })
                )
                .value(),
            ..._.chain(this.cluster.rooms)
                .flatMap((room) => room.find(FIND_STRUCTURES))
                .filter(
                    (s): s is StructureContainer =>
                        s.structureType === STRUCTURE_CONTAINER &&
                        s.isMiningContainer &&
                        s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                )
                .sortBy((container) =>
                    container.store.getUsedCapacity(RESOURCE_ENERGY)
                )
                .map(
                    (container): CynCluster.Task.Object.PickupStorage => ({
                        type: "PickupStorage",
                        priority: TaskPriority.HIGH,
                        from: container.id,
                        resource: RESOURCE_ENERGY,
                    })
                )
                .value(),
        ];

        // TODO other carry tasks
    }
}
