import CreepRoleWorker from ".";
import _ from "lodash";
import { ICreepWithRole } from "../../types";
import { CreepRole } from "..";

export default class CreepRoleBuildT1 extends CreepRoleWorker<CreepRole.Build> {
    public readonly neededParts = [WORK, MOVE, CARRY];
    public readonly role = CreepRole.Build;

    public work(creep: ICreepWithRole<CreepRole.Build>): boolean {
        const { data } = creep.memory.role;
        if (!data.target) {
            if (creep.refillIfNeeded(RESOURCE_ENERGY)) return true;

            // find a target
            const sites = _.sortBy(
                creep.room.find(FIND_MY_CONSTRUCTION_SITES),
                s => s.progressTotal
            );
            if (sites.length) {
                // picked the site with the least amount of progress needed (i.e. cheapest first)
                data.target = sites[0].id;
            }
        }

        const site = Game.getObjectById(data.target!);
        if (site && site instanceof ConstructionSite) {
            switch (creep.build(site)) {
                case OK:
                    creep.say("🚧");
                    break;
                case ERR_NOT_ENOUGH_ENERGY:
                    delete data.target;
                    break;
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(site);
                    break;
            }
            return true;
        } else delete data.target;

        return false;
    }

    public getNeededCreeps(room: Room): number {
        return (
            Math.max(
                1,
                Math.min(
                    Math.floor(
                        room.findCreepsOfRole(CreepRole.Harvest).length / 2
                    ),
                    Math.ceil(
                        _.sumBy(
                            room.find(FIND_MY_CONSTRUCTION_SITES),
                            c => c.progressTotal
                        ) / 20000
                    )
                )
            ) -
            room.findCreepsOfRoleWithAtLeastTier(this.role, this.tier + 1)
                .length
        );
    }

    public createNewRoleData(spawn: StructureSpawn) {
        return {};
    }
}
