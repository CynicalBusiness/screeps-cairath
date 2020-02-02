import { CreepRoles, ICreepRoleWorkerData } from "./creeps";
import CreepRoleWorker from "./creeps/roles";

export type CreepRoleOf<W extends CreepRoleWorker> = W extends CreepRoleWorker<
    infer T
>
    ? T
    : never;

export interface ICreepRoleMemory<TRole extends CreepRoles = CreepRoles> {
    name: TRole;
    data: ICreepRoleWorkerData[TRole];
    tier: number;
}

export interface ICreepWithRole<TRole extends CreepRoles> extends Creep {
    memory: CreepMemory<TRole>;
}

// tslint:disable interface-name no-namespace
declare global {
    interface Creep {
        /** The current role of this creep, if any */
        role?: CreepRoles;

        /** The tier of this creep */
        tier?: number;

        /** Moves the creep to the parking spot within the room. */
        moveToParking(): void;

        moveAndTransfer(resource: ResourceConstant): boolean;

        moveAndWithdraw(resource: ResourceConstant): boolean;

        refillIfNeeded(
            resource: ResourceConstant,
            onlyWhenEmpty?: boolean
        ): boolean;

        /** Gets the worker for this creep */
        getWorker(): CreepRoleWorker | undefined;

        /** Make the creep do work */
        doWork(): boolean;

        /** Go renew the creep if needed (and possible) */
        renewIfNeeded(): boolean;

        /**
         * Determines if a creep has a given role.
         * @param role The role to check
         */
        isRole<TRole extends CreepRoles>(
            role: CreepRoles
        ): this is ICreepWithRole<TRole>;
    }

    interface Room {
        /** Checks if a position is walkable */
        isWalkable(room: RoomPosition): boolean;

        /**
         * Finds all creeps
         * @param role
         */
        findCreepsOfRole<TRole extends CreepRoles>(
            role: TRole
        ): ICreepWithRole<TRole>[];
    }

    interface CreepMemory<TRole extends CreepRoles = CreepRoles> {
        role: ICreepRoleMemory<TRole>;
        homeRoom?: string;
        needsRenewing?: boolean;
        markedForRecycling?: boolean;
        upgrading?: boolean;
    }

    interface StructureSpawn {
        spawnCreepWithRole(role: CreepRoles, tier?: number): ScreepsReturnCode;

        getCapacityIncludingExtensions(
            resource: ResourceConstant
        ): number | null;
        getFreeCapacityIncludingExtensions(resource: ResourceConstant): number;
        getUsedCapacityIncludingExtensions(
            resource: ResourceConstant
        ): number | null;
    }

    interface RoomMemory {
        parkingFlag?: string;
    }

    interface Memory {
        homeRoom: string;
    }
}
