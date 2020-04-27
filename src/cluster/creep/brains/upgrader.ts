import { TaskPriority } from "../../task/delegator";
import { CreepBrain } from "../brain";
import { CynCreepController } from "../controller";

export class UpgraderBrain extends CreepBrain<"Upgrader"> {
    public constructor(controller: CynCreepController) {
        super(controller, "Upgrader");
    }

    public canTakeTask(
        task: CynCluster.Task.Object.Any
    ): task is CynCluster.Creep.RoleTaskOf<"Upgrader"> {
        return task.type === "UpgradeRoomController";
    }

    public work(
        creep: CynCluster.Creep.ClusterCreep<"Upgrader">
    ): CynCluster.Creep.RoleTasks["Upgrader"] | undefined {
        const { task } = creep;
        switch (task.type) {
            case "UpgradeRoomController":
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    const controller = Game.rooms[task.room]?.controller;
                    if (
                        controller &&
                        controller.owner?.username === creep.owner.username
                    ) {
                        switch (creep.upgradeController(controller)) {
                            case OK:
                                return task;
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(controller);
                        }
                    }
                    break;
                } else {
                    return {
                        type: "PickupStorage",
                        priority: TaskPriority.NORMAL,
                        resource: RESOURCE_ENERGY,
                    };
                }
            case "PickupStorage":
                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    let storage = task.from
                        ? Game.getObjectById(task.from)
                        : undefined;
                    if (!storage) {
                        // TODO find appropriate storage
                        storage = creep.room.find(
                            FIND_MY_SPAWNS
                        )[0] as StructureWithStorage<ResourceConstant, false>;
                    }

                    // go get it
                    if (storage) {
                        switch (creep.withdraw(storage, RESOURCE_ENERGY)) {
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(storage);
                        }
                    }
                } else return;
        }

        return;
    }

    public getBodyParts(size: number): BodyPartConstant[] {
        return CreepBrain.getGenericBody(size, [WORK, WORK, CARRY]);
    }
}
