import CreepRoleWorker from ".";
import { createOnlyOwnStructuresFilter } from "../../utils";
import _ from "lodash";
import { CreepRoleHarvestName } from "./harvest.t1";
import { ICreepWithRole } from "../../types";

export const CreepRoleRepairT1Name = "RepairT1";

export default class CreepRoleRepairT1 extends CreepRoleWorker<
    typeof CreepRoleRepairT1Name
> {
    public readonly neededParts = [WORK, MOVE, CARRY];
    public readonly role = CreepRoleRepairT1Name;

    public work(creep: ICreepWithRole<typeof CreepRoleRepairT1Name>): boolean {
        const { data } = creep.memory.role;
        if (creep.carry[RESOURCE_ENERGY] === 0) {
            delete data.target;
            return creep.moveAndWithdraw(RESOURCE_ENERGY);
        } else if (data.target) {
            const struct = Game.getObjectById(data.target);
            if (struct && struct.hits < struct.hitsMax) {
                if (creep.repair(struct) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(struct, {
                        visualizePathStyle: { stroke: "#ffff00" }
                    });
                }
            } else delete data.target;
            return true;
        }
        return false;
    }

    public getNeededCreeps(room: Room): number {
        return Math.max(
            Math.min(
                room.controller?.level ?? 0 - 1,
                Math.floor(
                    room.findCreepsOfRole(CreepRoleHarvestName).length / 3
                )
            ),
            1
        );
    }

    public createNewRoleData(spawn: StructureSpawn) {
        return {};
    }
}
