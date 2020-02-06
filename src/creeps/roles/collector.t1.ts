import CreepRoleWorker from ".";
import _ from "lodash";
import { ICreepWithRole } from "../../types";
import { CreepRole } from "..";

export default class CreepRoleCollectorT1 extends CreepRoleWorker<
    CreepRole.Collector
> {
    public readonly neededParts = [MOVE, CARRY, CARRY];
    public readonly role = CreepRole.Collector;

    public work(creep: ICreepWithRole<CreepRole.Collector>): boolean {
        const { room } = creep;

        if (creep.store.getUsedCapacity() > 0) {
            return creep.moveAndTransfer(
                Object.keys(creep.store)[0] as ResourceConstant
            );
        }

        // TODO make this work with more than just energy
        const toCollectFilter = {
            filter: (st: Tombstone | Ruin) =>
                st.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        };
        const toCollect = [
            ...room.find(FIND_DROPPED_RESOURCES, {
                filter: r => r.resourceType === RESOURCE_ENERGY
            }),
            ...room.find(FIND_TOMBSTONES, toCollectFilter),
            ...room.find(FIND_RUINS, toCollectFilter)
        ][0];
        if (toCollect) {
            switch (
                toCollect instanceof Resource
                    ? creep.pickup(toCollect)
                    : creep.withdraw(
                          toCollect,
                          RESOURCE_ENERGY
                          //   Object.keys(toCollect.store)[0] as ResourceConstant
                      )
            ) {
                case OK:
                    return true;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(toCollect, {
                        visualizePathStyle: { stroke: "#cc0000" }
                    });
                    return true;
                default:
                    return false;
            }
        } else if (room.energyAvailable < room.energyCapacityAvailable) {
            return creep.moveAndWithdraw(RESOURCE_ENERGY);
        } else return false;
    }

    public getNeededCreeps(room: Room): number {
        return (
            2 -
            room.findCreepsOfRoleWithAtLeastTier(this.role, this.tier + 1)
                .length
        );
    }

    public createNewRoleData() {
        return {};
    }
}
