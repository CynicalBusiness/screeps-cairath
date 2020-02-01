import CreepRoleWorker from ".";

export const CreepRoleUpgradeT1Name = "UpgradeT1";

export default class CreepRoleUpgradeT1 extends CreepRoleWorker<
    typeof CreepRoleUpgradeT1Name
> {
    public readonly neededParts = [WORK, MOVE, CARRY];

    public work(creep: Creep): boolean {
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.upgrading = false;
            creep.say("🔄 harvest");
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
            creep.memory.upgrading = true;
            creep.say("⚡ upgrade");
        }

        if (creep.memory.upgrading) {
            if (
                creep.upgradeController(creep.room.controller!) ===
                ERR_NOT_IN_RANGE
            ) {
                creep.moveTo(creep.room.controller!, {
                    visualizePathStyle: { stroke: "#ffffff" }
                });
            }
        } else {
            const spawn = Game.spawns.Home;
            if (
                spawn.store[RESOURCE_ENERGY] /
                    spawn.store.getCapacity(RESOURCE_ENERGY) >
                0.5
            ) {
                if (
                    creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(spawn, {
                        visualizePathStyle: { stroke: "#ffaa00" }
                    });
                }
            }
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
