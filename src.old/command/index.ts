import RoomDispatcher from "./dispatchers";
import RoomDispatcherHarvest from "./dispatchers/harvest";
import RoomDispatcherRepair from "./dispatchers/repair";

export enum RoomRole {
    Harvest = "harvest",
    Repair = "repair"
}

export interface IRoomRoleMemoryData extends Record<RoomRole, {}> {
    [RoomRole.Harvest]: {
        sources?: string[];
    };
    [RoomRole.Repair]: {
        targets?: Record<string, Id<Structure>>;
    };
}

export const RoomRoleDispatchers: {
    [TRole in RoomRole]: RoomDispatcher<TRole>;
} = {
    [RoomRole.Harvest]: new RoomDispatcherHarvest(),
    [RoomRole.Repair]: new RoomDispatcherRepair()
};
