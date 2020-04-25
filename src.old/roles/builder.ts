export default function builder(creep: Creep) {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.building = false;
        creep.say("🔄 harvest");
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
        creep.memory.building = true;
        creep.say("🚧 build");
    }

    if (creep.memory.building) {
        const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
            if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {
                    visualizePathStyle: { stroke: "#ffffff" }
                });
            }
        }
    } else {
        const source = _.first(
            creep.room.find(FIND_SOURCES, {
                filter: s => s.pos.isEqualTo(Game.flags.Energy2.pos)
            })
        );
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {
                visualizePathStyle: { stroke: "#ffaa00" }
            });
        }
    }
}
