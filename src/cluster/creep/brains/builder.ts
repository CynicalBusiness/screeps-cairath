import { TaskPriority } from "../../task/delegator";
import { CreepBrain } from "../brain";
import { CynCreepController } from "../controller";

export class BuilderBrain extends CreepBrain<"Builder"> {
    public constructor(controller: CynCreepController) {
        super(controller, "Builder");
    }

    public canTakeTask(
        task: CynCluster.Task.Object.Any
    ): task is CynCluster.Creep.RoleTaskOf<"Builder"> {
        return task.type === "Build" || task.type === "Repair";
    }

    public work(
        creep: CynCluster.Creep.ClusterCreep<"Builder">
    ): CynCluster.Creep.RoleTasks["Builder"] | undefined {
        const { task } = creep;
        outer: switch (task.type) {
            case "Build":
                const cs = Game.getObjectById(task.target);
                if (cs) {
                    if (cs.progress >= cs.progressTotal) return;
                    switch (creep.build(cs)) {
                        case ERR_NOT_ENOUGH_ENERGY:
                            break outer;
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(cs);
                            return task;
                    }
                } else return;
                break;
            case "Repair":
                const s = Game.getObjectById(task.target);
                if (s) {
                    if (s.hits >= s.hitsMax) return;
                    switch (creep.repair(s)) {
                        case ERR_NOT_ENOUGH_ENERGY:
                            break outer;
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(s);
                            return task;
                    }
                } else return;
                break;
            case "PickupStorage":
                const r = this.workStorageTask(creep, task);
                if (r !== null) return r;
        }

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0)
            return {
                type: "PickupStorage",
                priority: TaskPriority.NORMAL,
                resource: RESOURCE_ENERGY,
            };

        return;
    }

    public getBodyParts(size: number): BodyPartConstant[] {
        return CreepBrain.getGenericBody(size, [WORK, CARRY, CARRY]);
    }
}
