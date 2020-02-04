import RoomDispatcher from "./dispatchers";
import RoomDispatcherHarvest from "./dispatchers/harvest";

export enum RoomRole {
    Harvest = "harvest"
}

export interface IRoomRoleMemoryData extends Record<RoomRole, any> {
    [RoomRole.Harvest]: {
        sources?: string[];
    };
}

export const RoomRoleDispatchers: {
    [TRole in RoomRole]: RoomDispatcher<TRole>;
} = {
    [RoomRole.Harvest]: new RoomDispatcherHarvest()
};
