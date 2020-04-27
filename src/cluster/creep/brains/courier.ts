import _ from "lodash";
import { TaskPriority } from "../../task/delegator";
import { CreepBrain } from "../brain";
import { CynCreepController } from "../controller";

export class CourierBrain extends CreepBrain<"Courier"> {
    public constructor(controller: CynCreepController) {
        super(controller, "Courier");
    }

    public canTakeTask(
        task: CynCluster.Task.Object.Any
    ): task is CynCluster.Creep.RoleTaskOf<"Courier"> {
        return (
            task.type === "PickupPosition" ||
            task.type === "PickupStorage" ||
            task.type === "DropoffPosition" ||
            task.type === "DropoffStorage"
        );
    }

    public canCreepTakeTask(
        task: CynCluster.Creep.RoleTaskOf<"Courier">,
        creep: CynCluster.Creep.ClusterCreep<"Courier">
    ): boolean {
        switch (task.type) {
            case "PickupPosition":
            case "PickupStorage":
                return creep.store.getFreeCapacity(task.resource) > 0;
            case "DropoffPosition":
            case "DropoffStorage":
                return creep.store.getUsedCapacity(task.resource) > 0;
        }
        return false;
    }

    public work(
        creep: CynCluster.Creep.ClusterCreep<"Courier">
    ): CynCluster.Creep.RoleTasks["Courier"] | undefined {
        const { task } = creep;
        switch (task.type) {
            // TODO pickup/drop-off reservations
            case "PickupPosition":
                if (creep.store.getFreeCapacity(task.resource) ?? 0 > 0) {
                    const res = Game.getObjectById(task.from);
                    if (res) {
                        switch (creep.pickup(res)) {
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(res);
                                return task;
                        }
                    }
                }
                break;
            case "DropoffStorage":
                if (creep.store.getUsedCapacity(task.resource) > 0) {
                    let storage = task.to
                        ? Game.getObjectById(task.to)
                        : undefined;
                    if (!storage) {
                        // TODO find appropriate storage
                        if (task.resource === RESOURCE_ENERGY)
                            storage = creep.room.find(
                                FIND_MY_SPAWNS
                            )[0] as StructureWithStorage<
                                ResourceConstant,
                                false
                            >;
                    }

                    if (storage) {
                        switch (
                            creep.transfer(
                                storage,
                                task.resource,
                                task.amount
                                    ? Math.min(
                                          task.amount,
                                          creep.store.getUsedCapacity(
                                              task.resource
                                          ) ?? 0
                                      )
                                    : undefined
                            )
                        ) {
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(storage, { range: 1 });
                                break;
                        }
                    } else {
                        // if we still can't find a storage...
                        creep.drop(task.resource);
                    }
                }
            // TODO other two tasks
        }

        if (creep.store.getUsedCapacity() ?? 0 > 0) {
            return {
                type: "DropoffStorage",
                priority: TaskPriority.NORMAL,
                resource: _.find(
                    Object.keys(creep.store) as ResourceConstant[],
                    (res) => creep.store[res] > 0
                ) as ResourceConstant,
            };
        } else return undefined;
    }

    public getBodyParts(size: number): BodyPartConstant[] {
        // return _.flatten(_.fill([], [CARRY, CARRY, MOVE, MOVE], 0, size));
        return CreepBrain.getGenericBody(size, [CARRY, CARRY, MOVE]);
    }
}
