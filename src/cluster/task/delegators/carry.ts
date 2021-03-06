import _ from "lodash";
import { Priority, StorageType } from "../../../const";
import { TaskDelegator } from "../delegator";

export class CarryTaskDelegator extends TaskDelegator<
    CynCluster.Creep.RoleTasks["Courier"]
> {
    public findWork(): CynCluster.Creep.RoleTasks["Courier"][] {
        return [
            ..._.chain(this.cluster.findAll(FIND_DROPPED_RESOURCES))
                .map(
                    (res): CynCluster.Task.Object.PickupPosition => ({
                        type: "PickupPosition",
                        priority: Priority.HIGHEST,
                        from: res.id,
                        resource: res.resourceType,
                    })
                )
                .value(),
            ..._.chain([
                ...this.cluster.findAll(FIND_TOMBSTONES),
                ...this.cluster.findAll(FIND_RUINS),
            ])
                .filter((tb) => tb.store.getUsedCapacity() > 0)
                .map(
                    (tb): CynCluster.Task.Object.PickupRuin => ({
                        type: "PickupRuin",
                        priority: Priority.HIGHEST,
                        from: tb.id,
                    })
                )
                .value(),
            ..._.chain(this.cluster.findAll(FIND_STRUCTURES))
                .filter(
                    (s): s is StructureContainer =>
                        s.structureType === STRUCTURE_CONTAINER &&
                        s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                )
                .filter((s) => s.storage.isMiningContainer())
                .sortBy((container) =>
                    container.store.getUsedCapacity(RESOURCE_ENERGY)
                )
                .map(
                    (container): CynCluster.Task.Object.PickupStorage => ({
                        type: "PickupStorage",
                        priority: Priority.HIGH,
                        from: container.id,
                        resource: RESOURCE_ENERGY,
                    })
                )
                .value(),
        ];

        // TODO other carry tasks
    }
}
