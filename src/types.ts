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
}

// tslint:disable interface-name no-namespace
declare global {
    interface Creep {
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
    }

    interface Room {
        /** Checks if a position is walkable */
        isWalkable(room: RoomPosition): boolean;
    }

    interface CreepMemory<TRole extends CreepRoles = CreepRoles> {
        role?: ICreepRoleMemory<TRole>;
        homeRoom?: string;
        needsRenewing?: boolean;
        upgrading?: boolean;
    }

    interface StructureSpawn {
        spawnCreepWithRole(role: CreepRoles): ScreepsReturnCode;
    }

    interface RoomMemory {
        parkingFlag?: string;
    }

    interface Memory {
        homeRoom: string;
    }
}
