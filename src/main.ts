import { ErrorMapper } from "utils/ErrorMapper";
import "./prototypes";

import { Dictionary } from "lodash";
import _ from "lodash";
import { CreepRoles, CreepRoleWorkers } from "./creeps";
import { CreepRoleHarvestT1Name } from "./creeps/roles/harvest.t1";
import { CreepRoleUpgradeT1Name } from "./creeps/roles/upgrade.t1";
import roles, { RoleName } from "./roles";
import { CreepRoleRepairT1Name } from "./creeps/roles/repair.t1";
import { CreepRoleBuildT1Name } from "./creeps/roles/builder.t1";

interface IDesiredRoleData {
    amount: number;
    parts?: BodyPartConstant[];
}

const priorities = {
    [CreepRoleHarvestT1Name]: 0,
    [CreepRoleUpgradeT1Name]: 1,
    [CreepRoleBuildT1Name]: 2,
    [CreepRoleRepairT1Name]: 3
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    // console.log(`Current game tick is ${Game.time}`);

    const currentRoleWantedPerRoom: Dictionary<Record<CreepRoles, number>> = {};
    const currentRoleCountsPerRoom: Dictionary<Record<CreepRoles, number>> = {};

    _.each(Game.spawns, spawn => {
        if (!spawn.my) return;

        currentRoleCountsPerRoom[spawn.room.name] =
            currentRoleCountsPerRoom[spawn.room.name] ??
            _.mapValues(priorities, v => 0);

        if (currentRoleWantedPerRoom[spawn.room.name]) return;

        currentRoleWantedPerRoom[spawn.room.name] = _.mapValues(
            priorities,
            () => 0
        );
        _.each(Object.keys(priorities) as CreepRoles[], role => {
            currentRoleWantedPerRoom[spawn.room.name][role] = CreepRoleWorkers[
                role
            ].getNeededCreeps(spawn.room);
        });
    });

    // issue work to creeps
    _.each(Game.creeps, creep => {
        const { role } = creep.memory;
        if (role) {
            const worker = creep.getWorker();
            if (worker) {
                const roomName = creep.memory.homeRoom ?? creep.room.name;
                currentRoleCountsPerRoom[roomName][role.name]++;
                if (!creep.doWork()) creep.moveToParking();
            }
        }
    });

    // spawn creeps up to needed values
    forEachRoom: for (const roomName of Object.keys(currentRoleWantedPerRoom)) {
        const counts = currentRoleCountsPerRoom[roomName];
        const wanted = currentRoleWantedPerRoom[roomName];
        const rolesPriority = _.sortBy(
            Object.keys(priorities) as CreepRoles[],
            name => priorities[name]
        );

        const room = Game.rooms[roomName];
        const spawns = room.find(FIND_MY_SPAWNS);

        forEachRole: for (const role of rolesPriority) {
            if (counts[role] < wanted[role])
                for (const spawn of spawns) {
                    if (
                        !spawn.spawning &&
                        spawn.spawnCreepWithRole(role) === OK
                    ) {
                        console.log(
                            `Successfully spawned ${role} at ${
                                spawn.name
                            } (${counts[role] + 1}/${wanted[role]})`
                        );
                    }
                    break forEachRole;
                }
        }
    }

    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
});

console.log("Successfully updated scripts: ", new Date().toISOString());
