import CreepRoleWorker from ".";
import { getNeighbors } from "../../utils";
import { getStorageWithAvailableSpace } from "../misc";

export const CreepRoleHarvestT1Name = "HarvestT1";

export interface ICreepRoleHarvestData {
    source?: string;
    spawnName: string;
}

export default class CreepRoleHarvestT1 extends CreepRoleWorker<
    typeof CreepRoleHarvestT1Name
> {
    public readonly neededParts = [WORK, MOVE, CARRY];

    public work(creep: Creep, data: ICreepRoleHarvestData): boolean {
        if (creep.store.getFreeCapacity() > 0) {
            if (data.source) {
                const source = Game.getObjectById(data.source) as Source;
                switch (creep.harvest(source)) {
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(source, {
                            visualizePathStyle: { stroke: "#ffaa00" }
                        });
                        break;
                }
                return true;
            }
        } else {
            // delete data.source;
            if (creep.moveAndTransfer(RESOURCE_ENERGY)) return true;
        }
        return false;
    }

    public getNeededCreeps(room: Room): number {
        let needed = 8;

        for (const source of room.find(FIND_SOURCES)) {
            for (const neighbor of getNeighbors(source.pos)) {
                if (room.isWalkable(neighbor)) {
                    needed++;
                }
            }

            // TODO do all sources
            break;
        }

        return needed;
    }

    public shouldStartProduction(room: Room): boolean {
        // TODO actually check this somehow
        return true;
    }

    public createNewRoleData(spawn: StructureSpawn) {
        return {
            spawnName: spawn.name
        };
    }
}
