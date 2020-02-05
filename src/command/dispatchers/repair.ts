import RoomDispatcher from ".";
import { RoomRole, IRoomRoleMemoryData } from "..";
import { CreepRoleHarvestName } from "../../creeps/roles/harvest.t1";
import { createOnlyOwnStructuresFilter } from "../../utils";
import { CreepRoleRepairT1Name } from "../../creeps/roles/repair.t1";
import _ from "lodash";

export default class RoomDispatcherRepair extends RoomDispatcher<
    RoomRole.Repair
> {
    public readonly name = RoomRole.Repair;

    public dispatch(room: Room, data: IRoomRoleMemoryData[RoomRole.Repair]) {
        if (!data.targets) data.targets = {};

        const creeps = _.filter(
            room.findCreepsOfRole(CreepRoleRepairT1Name),
            c => !c.memory.role.data.target
        );

        if (creeps.length) {
            const hasTower =
                room.find(FIND_MY_STRUCTURES, {
                    filter: st => st instanceof StructureTower
                }).length > 0;
            const structs = _.sortBy(
                room.find(
                    FIND_STRUCTURES,
                    createOnlyOwnStructuresFilter(
                        st =>
                            st.hits < st.hitsMax &&
                            !(st.id in Object.values(data.targets!)) &&
                            (!(st instanceof StructureRoad) || !hasTower)
                    )
                ),
                st => st.hits
            );

            for (let i = 0; i < Math.min(structs.length, creeps.length); i++) {
                creeps[i].memory.role.data.target = structs[i].id;
                data.targets[creeps[i].id] = structs[i].id;
            }
        }
    }

    public createNewMemoryData(): IRoomRoleMemoryData[RoomRole.Repair] {
        return {};
    }
}
