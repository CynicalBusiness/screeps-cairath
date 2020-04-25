import { RoomRole, IRoomRoleMemoryData } from "..";
import { IRoomRoleMemory } from "../../types";

/**
 * A dispatcher controls tasks for creeps in a room.
 */
export default abstract class RoomDispatcher<
    TRole extends RoomRole = RoomRole
> {
    public abstract readonly name: TRole;

    /**
     * A dispatcher called on each game loop
     * @param room The room to check
     * @param memory The memory data for the room belonging to this dispatcher's role
     */
    public abstract dispatch(
        room: Room,
        memory: IRoomRoleMemoryData[TRole]
    ): void;

    /**
     * Creates new memory data for this role dispatcher
     */
    public abstract createNewMemoryData(): IRoomRoleMemoryData[TRole];

    /**
     * Creates new memory for this dispatcher
     */
    public createNewMemory(): IRoomRoleMemory<TRole> {
        return {
            name: this.name,
            data: this.createNewMemoryData()
        };
    }
}
