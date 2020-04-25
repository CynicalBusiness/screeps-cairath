import { createOnlyOwnStructuresFilter } from "../utils";

export default function repairer(creep: Creep) {
    const structs = creep.room.find(
        FIND_STRUCTURES,
        createOnlyOwnStructuresFilter(s => s.hits < s.hitsMax)
    );
    if (structs.length) {
        if (creep.carry[RESOURCE_ENERGY] === 0) {
            const spawn = Game.spawns.Initial;
            if (
                spawn.store[RESOURCE_ENERGY] /
                    spawn.store.getCapacity(RESOURCE_ENERGY) >
                0.5
            ) {
                if (
                    creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(spawn, {
                        visualizePathStyle: { stroke: "#ffaa00" }
                    });
                }
            }
        } else {
            if (creep.repair(structs[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(structs[0], {
                    visualizePathStyle: { stroke: "#ffaa00" }
                });
            }
        }
    } else {
        creep.moveToParking();
    }
}
