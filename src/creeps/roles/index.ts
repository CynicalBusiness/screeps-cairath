import { CreepRoles, ICreepRoleWorkerData } from "..";

/** A singleton class used for controlling different kinds of creeps */
export default abstract class CreepRoleWorker<
    TRole extends CreepRoles = CreepRoles
> {
    public abstract neededParts: BodyPartConstant[];

    /**
     * Makes the creep do work, returning if work was able to be completed.
     * @param creep The creep
     */
    public abstract work(
        creep: Creep,
        data: ICreepRoleWorkerData[TRole]
    ): boolean;

    /**
     * Gets the number of creeps needed in a room
     * @param room The room
     */
    public abstract getNeededCreeps(room: Room): number;

    /**
     * Whether or not to produce this kind of creep.
     */
    public abstract shouldStartProduction(room: Room): boolean;

    public abstract createNewRoleData(
        spawn: StructureSpawn
    ): ICreepRoleWorkerData[TRole];

    public createNewMemory(
        spawn: StructureSpawn,
        name: TRole
    ): CreepMemory<TRole> {
        return {
            ...this.createGenericMemory(spawn),
            role: {
                name,
                data: this.createNewRoleData(spawn)
            }
        };
    }

    public createGenericMemory(
        spawn: StructureSpawn
    ): Omit<CreepMemory, "role"> {
        return {
            homeRoom: spawn.room.name
        };
    }
}
