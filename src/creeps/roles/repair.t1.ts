import CreepRoleWorker from ".";
import { createOnlyOwnStructuresFilter } from "../../utils";

export const CreepRoleRepairT1Name = "RepairT1";

export default class CreepRoleRepairT1 extends CreepRoleWorker<
    typeof CreepRoleRepairT1Name
> {
    public readonly neededParts = [WORK, MOVE, CARRY];

    public work(creep: Creep): boolean {
        const structs = creep.room.find(
            FIND_STRUCTURES,
            createOnlyOwnStructuresFilter(s => s.hits < s.hitsMax)
        );
        if (structs.length) {
            if (creep.carry[RESOURCE_ENERGY] === 0) {
                const spawn = Game.spawns.Home;
                if (
                    spawn.store[RESOURCE_ENERGY] /
                        spawn.store.getCapacity(RESOURCE_ENERGY) >
                    0.5
                ) {
                    if (
                        creep.withdraw(spawn, RESOURCE_ENERGY) ===
                        ERR_NOT_IN_RANGE
                    ) {
                        creep.moveTo(spawn, {
                            visualizePathStyle: { stroke: "#ffaa00" }
                        });
                    }
                }
                return false;
            } else {
                if (creep.repair(structs[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structs[0], {
                        visualizePathStyle: { stroke: "#ffaa00" }
                    });
                }
            }
        } else {
            creep.moveToParking();
        }
        return true;
    }

    public getNeededCreeps(room: Room): number {
        return 1;
    }

    public shouldStartProduction(room: Room): boolean {
        // TODO actually check this somehow
        return true;
    }

    public createNewRoleData(spawn: StructureSpawn) {
        return {};
    }
}
