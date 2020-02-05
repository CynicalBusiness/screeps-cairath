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

        const toCollectFilter = {
            filter: (st: Tombstone | Ruin) => st.store.getUsedCapacity() > 0
        };
        const toCollect = [
            ...room.find(FIND_DROPPED_RESOURCES),
            ...room.find(FIND_TOMBSTONES, toCollectFilter),
            ...room.find(FIND_RUINS, toCollectFilter)
        ][0];
        if (toCollect) {
            switch (
                toCollect instanceof Resource
                    ? creep.pickup(toCollect)
                    : creep.withdraw(
                          toCollect,
                          Object.keys(toCollect.store)[0] as ResourceConstant
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
        return 1;
    }

    public createNewRoleData() {
        return {};
    }
}
