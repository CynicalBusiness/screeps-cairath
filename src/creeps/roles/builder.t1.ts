import CreepRoleWorker from ".";
import _ from "lodash";
import { ICreepWithRole } from "../../types";
import { CreepRoleHarvestName } from "./harvest.t1";

export const CreepRoleBuildT1Name = "BuildT1";

export interface ICreepRoleBuildData {
    target?: string;
}

export default class CreepRoleBuildT1 extends CreepRoleWorker<
    typeof CreepRoleBuildT1Name
> {
    public readonly neededParts = [WORK, MOVE, CARRY];
    public readonly role = CreepRoleBuildT1Name;

    public work(creep: ICreepWithRole<typeof CreepRoleBuildT1Name>): boolean {
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
        return Math.max(
            1,
            Math.min(
                room.findCreepsOfRole(CreepRoleHarvestName).length / 2,
                room.find(FIND_MY_CONSTRUCTION_SITES).length / 2
            )
        );
    }

    public shouldStartProduction(room: Room): boolean {
        // TODO actually check this somehow
        return true;
    }

    public createNewRoleData(spawn: StructureSpawn) {
        return {};
    }
}
