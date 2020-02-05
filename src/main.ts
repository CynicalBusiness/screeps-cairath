import { ErrorMapper } from "utils/ErrorMapper";
import "./prototypes";

import { Dictionary } from "lodash";
import _ from "lodash";
import { CreepRoles, CreepRoleWorkers } from "./creeps";
import { CreepRoleHarvestName } from "./creeps/roles/harvest.t1";
import { CreepRoleUpgradeT1Name } from "./creeps/roles/upgrade.t1";
import roles, { RoleName } from "./roles";
import { CreepRoleRepairT1Name } from "./creeps/roles/repair.t1";
import { CreepRoleBuildT1Name } from "./creeps/roles/builder.t1";
import CreepRoleWorker from "./creeps/roles";
import operateTower from "./tower";

interface IDesiredRoleData {
    amount: number;
    parts?: BodyPartConstant[];
}

const prioritiesArray: CreepRoles[] = [
    CreepRoleHarvestName,
    CreepRoleUpgradeT1Name,
    CreepRoleBuildT1Name,
    CreepRoleRepairT1Name
];
const priorities = _.fromPairs(prioritiesArray.map((w, i) => [w, i])) as Record<
    CreepRoles,
    number
>;

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    // console.log(`Current game tick is ${Game.time}`);

    const currentRoleWantedPerRoom: Dictionary<Record<
        CreepRoles,
        number[]
    >> = {};
    const currentRoleCountsPerRoom: Dictionary<Record<
        CreepRoles,
        number[]
    >> = {};
    const maxTierPerRoom: Dictionary<number> = {};

    _.each(Game.spawns, spawn => {
        if (!spawn.my) return;
        const { name: roomName } = spawn.room;
        maxTierPerRoom[roomName] = 0;

        if (!currentRoleWantedPerRoom[roomName]) {
            const counts = _.mapValues(priorities, () => [] as number[]);
            _.each(prioritiesArray, role => {
                counts[role] = _.map<CreepRoleWorker, number>(
                    CreepRoleWorkers[role],
                    w => w.getNeededCreeps(spawn.room)
                );
                maxTierPerRoom[roomName] = Math.max(
                    maxTierPerRoom[roomName],
                    CreepRoleWorkers[role].length
                );
            });
            currentRoleWantedPerRoom[roomName] = counts;
        }

        if (!currentRoleCountsPerRoom[roomName]) {
            const counts = _.mapValues(priorities, () => [] as number[]);
            _.each(prioritiesArray, role => {
                counts[role] = _.map<CreepRoleWorker, number>(
                    CreepRoleWorkers[role],
                    () => 0
                );
            });
            // I don't know why lodash types are so fucked, but this works
            currentRoleCountsPerRoom[roomName] = counts;
        }
    });

    // issue work to creeps
    _.each(Game.creeps, creep => {
        const { role } = creep.memory;
        if (role) {
            const worker = creep.getWorker();
            const roomName = creep.memory.homeRoom ?? creep.room.name;
            const roomCounts = currentRoleCountsPerRoom[roomName][role.name];
            if (worker && roomCounts) {
                const tier = worker.tier - 1;
                roomCounts[tier]++;
                if (
                    roomCounts[tier] >
                        currentRoleWantedPerRoom[roomName][role.name][tier] &&
                    !creep.memory.markedForRecycling
                ) {
                    creep.memory.markedForRecycling = true;
                } else if (!creep.doWork()) creep.moveToParking();
            }
        }
    });

    // spawn creeps up to needed values
    for (const [roomName, room] of _.toPairs(Game.rooms)) {
        room.dispatchAll();
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: st => st instanceof StructureTower
        }) as StructureTower[];
        if (towers.length) {
            _.each(towers, operateTower);
        }

        if (roomName in Object.keys(currentRoleWantedPerRoom)) {
            const counts = currentRoleCountsPerRoom[roomName];
            const wanted = currentRoleWantedPerRoom[roomName];
            const rolesPriority = _.sortBy(
                Object.keys(priorities) as CreepRoles[],
                name => priorities[name]
            );

            const spawns = room.find(FIND_MY_SPAWNS);
            if (!spawns.length) continue;

            forEachTier: for (
                let tier = 0;
                tier < maxTierPerRoom[roomName];
                tier++
            ) {
                for (const role of rolesPriority) {
                    const worker = CreepRoleWorkers[role][tier];
                    if (!worker) continue;
                    if (wanted[role]) {
                        if (
                            (counts[role][tier] === undefined ||
                                counts[role][tier] < wanted[role][tier]) &&
                            worker.shouldStartProduction(room)
                        ) {
                            for (const spawn of spawns) {
                                if (
                                    !spawn.spawning &&
                                    spawn.spawnCreepWithRole(role, tier + 1) ===
                                        OK
                                ) {
                                    console.log(
                                        `Spawned ${roomName}/${
                                            spawn.name
                                        }: ${role} T${tier + 1} (${(counts[
                                            role
                                        ][tier] ?? 0) + 1}/${
                                            wanted[role][tier]
                                        })`
                                    );
                                }
                                break forEachTier;
                            }
                        }
                    }
                }
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
