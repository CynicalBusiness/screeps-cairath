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
            task.type === "PickupRuin" ||
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
            case "PickupRuin":
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
            case "PickupPosition":
            case "PickupStorage":
            case "PickupRuin":
            case "DropoffPosition":
            case "DropoffStorage":
                const r = this.workStorageTask(creep, task);
                if (r !== null) return r;
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
        }
        return;
    }

    public getBodyParts(size: number): BodyPartConstant[] {
        // return _.flatten(_.fill([], [CARRY, CARRY, MOVE, MOVE], 0, size));
        return CreepBrain.getGenericBody(size, [CARRY, CARRY, MOVE]);
    }
}
