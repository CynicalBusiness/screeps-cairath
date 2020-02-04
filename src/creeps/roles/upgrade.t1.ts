import CreepRoleWorker from ".";
import { CreepRoleHarvestName } from "./harvest.t1";

export const CreepRoleUpgradeT1Name = "UpgradeT1";

export default class CreepRoleUpgradeT1 extends CreepRoleWorker<
    typeof CreepRoleUpgradeT1Name
> {
    public readonly neededParts = [WORK, MOVE, CARRY];
    public readonly role = CreepRoleUpgradeT1Name;

    public work(creep: Creep): boolean {
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.upgrading = false;
            creep.say("🔄 harvest");
            return true;
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
            creep.memory.upgrading = true;
            creep.say("⚡ upgrade");
            return true;
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
            return true;
        } else {
            if (creep.moveAndWithdraw(RESOURCE_ENERGY)) return true;
        }
        return false;
    }

    public getNeededCreeps(room: Room): number {
        return Math.max(1, room.controller?.level ?? 0 - this.tier);
    }

    public shouldStartProduction(room: Room): boolean {
        return !!room.controller;
    }

    public createNewRoleData(spawn: StructureSpawn) {
        return {};
    }
}
