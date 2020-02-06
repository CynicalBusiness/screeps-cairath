import CreepRoleWorker from ".";
import { getNeighbors } from "../../utils";
import { ICreepWithRole } from "../../types";
import _ from "lodash";
import { CreepRole } from "..";

export default class CreepRoleHarvestT1 extends CreepRoleWorker<
    typeof CreepRole.Harvest
> {
    public readonly neededParts = [WORK, MOVE, CARRY];
    public readonly role = CreepRole.Harvest;

    public work(creep: ICreepWithRole<CreepRole.Harvest>): boolean {
        const { data } = creep.memory.role;

        if (data.needsUnloading) {
            if (
                creep.store[RESOURCE_ENERGY] === 0 ||
                !this.tryToUnload(creep)
            ) {
                delete data.needsUnloading;
            }
            return true;
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
                case ERR_NOT_ENOUGH_RESOURCES:
                case ERR_TIRED:
                    return false;
            }
            return true;
        }
    }

    public getNeededCreeps(room: Room): number {
        const sources = room.find(FIND_SOURCES);
        let needed = sources.length;

        for (const source of sources) {
            for (const neighbor of getNeighbors(source.pos)) {
                if (room.isWalkable(neighbor)) {
                    needed++;
                }
            }
        }

        return (
            needed -
            room.findCreepsOfRoleWithAtLeastTier(this.role, this.tier + 1)
                .length
        );
    }

    public createNewRoleData(spawn: StructureSpawn) {
        return {
            spawnName: spawn.name
        };
    }

    private tryToUnload(creep: ICreepWithRole<CreepRole.Harvest>): boolean {
        const { room } = creep;
        const storage = _.sortBy(
            room.find(FIND_MY_STRUCTURES, {
                filter: s => s instanceof StructureStorage
            }) as StructureStorage[],
            st => st.store.getFreeCapacity(RESOURCE_ENERGY)
        ).reverse()[0];

        if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            switch (creep.transfer(storage, RESOURCE_ENERGY)) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(storage);
                    return true;
                case OK:
                    return true;
                default:
                    return false;
            }
        } else return creep.moveAndTransfer(RESOURCE_ENERGY);
    }
}
