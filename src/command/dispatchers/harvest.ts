import RoomDispatcher from ".";
import { RoomRole, IRoomRoleMemoryData } from "..";
import { CreepRoleHarvestName } from "../../creeps/roles/harvest.t1";

export default class RoomDispatcherHarvest extends RoomDispatcher<
    RoomRole.Harvest
> {
    public readonly name = RoomRole.Harvest;

    public dispatch(room: Room, data: IRoomRoleMemoryData[RoomRole.Harvest]) {
        const sources = room.find(FIND_SOURCES);

        // TODO be more practical with flags and such
        let sourceIdx = 0;
        const creeps = room.findCreepsOfRole(CreepRoleHarvestName);
        for (const creep of creeps) {
            creep.memory.role.data.source = sources[sourceIdx++].id;
            sourceIdx %= 2;
        }
    }

    public createNewMemoryData(): IRoomRoleMemoryData[RoomRole.Harvest] {
        return {};
    }
}
