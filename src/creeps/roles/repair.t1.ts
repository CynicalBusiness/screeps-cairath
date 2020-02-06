import CreepRoleWorker from ".";
import _ from "lodash";
import { ICreepWithRole } from "../../types";
import { CreepRole } from "..";

export default class CreepRoleRepairT1 extends CreepRoleWorker<
    CreepRole.Repair
> {
    public readonly neededParts = [WORK, MOVE, CARRY];
    public readonly role = CreepRole.Repair;

    public work(creep: ICreepWithRole<CreepRole.Repair>): boolean {
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
        return (
            Math.max(
                Math.min(
                    room.controller?.level ?? 0 - 1,
                    Math.floor(
                        room.findCreepsOfRole(CreepRole.Harvest).length / 3
                    )
                ),
                1
            ) -
            room.findCreepsOfRoleWithAtLeastTier(this.role, this.tier + 1)
                .length
        );
    }

    public createNewRoleData() {
        return {};
    }
}
