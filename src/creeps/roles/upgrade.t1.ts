import CreepRoleWorker from ".";
import _ from "lodash";
import { ICreepWithRole } from "../../types";
import { CreepRole } from "..";

export default class CreepRoleUpgradeT1 extends CreepRoleWorker<
    CreepRole.Upgrade
> {
    public readonly neededParts = [WORK, MOVE, CARRY];
    public readonly role = CreepRole.Upgrade;

    public work(creep: ICreepWithRole<CreepRole.Upgrade>): boolean {
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
            Math.max(1, (room.controller?.level ?? 0) - this.tier) -
            room.findCreepsOfRoleWithAtLeastTier(this.role, this.tier + 1)
                .length
        );
    }

    public createNewRoleData() {
        return {};
    }
}
