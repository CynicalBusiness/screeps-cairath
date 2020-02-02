import { CreepRoles, ICreepRoleWorkerData, CreepRoleWorkers } from "..";
import { ICreepWithRole } from "../../types";

/** A singleton class used for controlling different kinds of creeps */
export default abstract class CreepRoleWorker<
    TRole extends CreepRoles = CreepRoles
> {
    public abstract neededParts: BodyPartConstant[];
    public abstract role: TRole;

    private _tier?: number;
    public get tier() {
        if (!this._tier) {
            const workers = CreepRoleWorkers[this.role] as CreepRoleWorker<
                TRole
            >[];
            this._tier = workers ? workers.indexOf(this) + 1 : 0;
        }
        return this._tier;
    }

    /**
     * Makes the creep do work, returning if work was able to be completed.
     * @param creep The creep
     */
    public abstract work(creep: ICreepWithRole<TRole>): boolean;

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

    public createNewMemory(spawn: StructureSpawn): CreepMemory<TRole> {
        return {
            ...this.createGenericMemory(spawn),
            role: {
                name: this.role,
                data: this.createNewRoleData(spawn),
                tier: this.tier
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
