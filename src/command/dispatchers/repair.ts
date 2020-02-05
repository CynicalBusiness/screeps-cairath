import RoomDispatcher from ".";
import { RoomRole, IRoomRoleMemoryData } from "..";
import { createOnlyOwnStructuresFilter } from "../../utils";
import _ from "lodash";
import { CreepRole } from "../../creeps";

export default class RoomDispatcherRepair extends RoomDispatcher<
    RoomRole.Repair
> {
    public readonly name = RoomRole.Repair;

    public dispatch(room: Room, data: IRoomRoleMemoryData[RoomRole.Repair]) {
        if (!data.targets) data.targets = {};

        const creeps = _.filter(
            room.findCreepsOfRole(CreepRole.Repair),
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
