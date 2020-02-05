import _ from "lodash";

export default function operateTower(tower: StructureTower) {
    const { room } = tower;

    const hostile =
        tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS) ??
        tower.pos.findClosestByRange(FIND_HOSTILE_POWER_CREEPS);
    if (hostile) {
        tower.attack(hostile);
        return;
    }

    const missingHitsFilter = {
        filter: (v: AnyCreep | AnyStructure) => v.hits < v.hitsMax
    };
    const wounded =
        tower.pos.findClosestByRange(FIND_MY_CREEPS, missingHitsFilter) ??
        tower.pos.findClosestByRange(FIND_MY_POWER_CREEPS, missingHitsFilter);
    if (wounded) {
        tower.heal(wounded);
        return;
    }

    const roadNeedingRepair = _.sortBy(
        room.find(FIND_STRUCTURES, {
            filter: st => st instanceof StructureRoad && st.hits < st.hitsMax
        }) as StructureRoad[],
        st => st.hits
    )[0];
    if (roadNeedingRepair) {
        tower.repair(roadNeedingRepair);
        return;
    }
}
