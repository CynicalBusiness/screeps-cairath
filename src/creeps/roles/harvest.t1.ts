import CreepRoleWorker from ".";
import { getNeighbors } from "../../utils";
import { ICreepWithRole } from "../../types";
import _ from "lodash";

export const CreepRoleHarvestName = "Harvest";

export default class CreepRoleHarvestT1 extends CreepRoleWorker<
    typeof CreepRoleHarvestName
> {
    public readonly neededParts = [WORK, MOVE, CARRY];
    public readonly role = CreepRoleHarvestName;

    public work(creep: ICreepWithRole<typeof CreepRoleHarvestName>): boolean {
        const { data } = creep.memory.role;

        if (data.needsUnloading) {
            if (
                creep.store[RESOURCE_ENERGY] === 0 ||
                creep.moveAndTransfer(RESOURCE_ENERGY)
            ) {
                delete data.needsUnloading;
                return true;
            }
        } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            data.needsUnloading = true;
            return this.work(creep);
        } else {
            const source = data.source
                ? (Game.getObjectById(data.source) as Source)
                : creep.room.find(FIND_SOURCES)[0];
            switch (creep.harvest(source)) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(source, {
                        visualizePathStyle: { stroke: "#ffaa00" }
                    });
                    break;
            }
            return true;
        }
        return false;
    }

    public getNeededCreeps(room: Room): number {
        let needed = 2;

        for (const source of room.find(FIND_SOURCES)) {
            for (const neighbor of getNeighbors(source.pos)) {
                if (room.isWalkable(neighbor)) {
                    needed++;
                }
            }
        }

        return (
            needed -
            _.filter(
                room.findCreepsOfRole(this.role),
                c => c.tier === this.tier + 1
            ).length
        );
    }

    public shouldStartProduction(room: Room): boolean {
        return !!room.controller && room.controller.level >= this.tier;
    }

    public createNewRoleData(spawn: StructureSpawn) {
        return {
            spawnName: spawn.name
        };
    }
}
