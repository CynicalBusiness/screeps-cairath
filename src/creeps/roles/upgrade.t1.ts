import CreepRoleWorker from ".";
import _ from "lodash";
import { ICreepWithRole } from "../../types";

export const CreepRoleUpgradeT1Name = "UpgradeT1";

export default class CreepRoleUpgradeT1 extends CreepRoleWorker<
    typeof CreepRoleUpgradeT1Name
> {
    public readonly neededParts = [WORK, MOVE, CARRY];
    public readonly role = CreepRoleUpgradeT1Name;

    public work(creep: ICreepWithRole<typeof CreepRoleUpgradeT1Name>): boolean {
        const { data } = creep.memory.role;

        if (data.upgrading) {
            switch (creep.upgradeController(creep.room.controller!)) {
                case OK:
                    return true;
                case ERR_NOT_ENOUGH_RESOURCES:
                    delete data.upgrading;
                    return this.work(creep);
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(creep.room.controller!, {
                        visualizePathStyle: { stroke: "#ffffff" }
                    });
                    return true;
            }
            return false;
        } else {
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                return creep.moveAndWithdraw(RESOURCE_ENERGY);
            } else {
                data.upgrading = true;
                return this.work(creep);
            }
        }
    }

    public getNeededCreeps(room: Room): number {
        return (
            Math.max(1, (room.controller?.level ?? 0) - this.tier + 1) -
            _.filter(
                room.findCreepsOfRole(this.role),
                c => c.tier && c.tier > this.tier
            ).length
        );
    }

    public createNewRoleData(spawn: StructureSpawn) {
        return {};
    }
}
