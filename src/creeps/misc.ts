import { getHomeRoom } from "../utils";
import _ from "lodash";

export function moveToParking(creep: Creep) {
    const { room } = creep;
    const parkingFlag =
        Game.flags[
            room.memory.parkingFlag ?? getHomeRoom().memory.parkingFlag!
        ];

    if (parkingFlag) {
        creep.moveTo(parkingFlag, {
            visualizePathStyle: { stroke: "#0000FF" }
        });
    }
}

export const STORAGE_PRIORITIES = [
    STRUCTURE_SPAWN,
    STRUCTURE_CONTAINER,
    STRUCTURE_STORAGE
];

export type StorageStructures =
    | StructureSpawn
    | StructureContainer
    | StructureStorage;

export function getStorage<R extends ResourceConstant>(
    room: Room,
    resource: R,
    filter: (
        st: StructureSpawn | StructureContainer | StructureStorage
    ) => boolean,
    reversePriority: boolean = false
): StorageStructures | undefined {
    const storages = _.sortBy(
        room.find(FIND_STRUCTURES, {
            filter: st =>
                (st instanceof StructureSpawn ||
                    st instanceof StructureContainer ||
                    st instanceof StructureStorage) &&
                ((st instanceof OwnedStructure && st.my) ||
                    (room.controller && room.controller.my))
        }) as StorageStructures[],
        st => STORAGE_PRIORITIES.indexOf(st.structureType)
    );
    return reversePriority ? storages.pop() : storages[0];
}

export function getStorageWithAvailableSpace(
    room: Room,
    resource: ResourceConstant
) {
    return getStorage(
        room,
        resource,
        st => st.store.getFreeCapacity(resource) > 0
    );
}

export function getStorageWithAvailableResource(
    room: Room,
    resource: ResourceConstant
) {
    return getStorage(
        room,
        resource,
        st => (st.store[resource] ?? 0) > 0,
        true
    );
}

export function getMaxTicksToLive(creep: Creep): number {
    return 1500; // is this defined somewhere?
}

export function renewIfNeeded(creep: Creep): boolean {
    if (!creep.ticksToLive) return true;
    if (creep.ticksToLive < 250) {
        creep.memory.needsRenewing = true;
    } else if (creep.ticksToLive > getMaxTicksToLive(creep) - 100) {
        delete creep.memory.needsRenewing;
    }

    if (creep.memory.needsRenewing) {
        const spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
        if (spawn) {
            switch (spawn.renewCreep(creep)) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(spawn);
                    break;
                case ERR_NOT_ENOUGH_ENERGY:
                    delete creep.memory.needsRenewing;
                    break;
                default:
                    creep.say("♻");
            }

            return true;
        }
    }
    return false;
}
