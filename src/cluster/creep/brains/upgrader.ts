import { Priority } from "../../../const";
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
                            case ERR_NOT_IN_RANGE:
                                creep.moveTo(controller);
                        }
                        return task;
                    }
                    break;
                } else {
                    return {
                        type: "PickupStorage",
                        priority: Priority.NORMAL,
                        resource: RESOURCE_ENERGY,
                    };
                }
            case "PickupStorage":
                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    const storage = task.from
                        ? Game.getObjectById(task.from)
                        : creep.room.findAppropriateStorage("pickup", {
                              resource: RESOURCE_ENERGY,
                          });

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
