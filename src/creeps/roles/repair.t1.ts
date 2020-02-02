import CreepRoleWorker from ".";
import { createOnlyOwnStructuresFilter } from "../../utils";
import _ from "lodash";

export const CreepRoleRepairT1Name = "RepairT1";

export default class CreepRoleRepairT1 extends CreepRoleWorker<
    typeof CreepRoleRepairT1Name
> {
    public readonly neededParts = [WORK, MOVE, CARRY];
    public readonly role = CreepRoleRepairT1Name;

    public work(creep: Creep): boolean {
        const structs = _.sortBy(
            creep.room.find(
                FIND_STRUCTURES,
                createOnlyOwnStructuresFilter(s => s.hits < s.hitsMax)
            ),
            s => s.hits
        );
        if (structs.length) {
            if (creep.carry[RESOURCE_ENERGY] === 0) {
                return creep.moveAndWithdraw(RESOURCE_ENERGY);
            } else {
                if (creep.repair(structs[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structs[0], {
                        visualizePathStyle: { stroke: "#ffaa00" }
                    });
                }
                return true;
            }
        }
        return false;
    }

    public getNeededCreeps(room: Room): number {
        return Math.max((room.controller?.level ?? 0) - 1, 1);
    }

    public shouldStartProduction(room: Room): boolean {
        return !!room.controller;
    }

    public createNewRoleData(spawn: StructureSpawn) {
        return {};
    }
}
