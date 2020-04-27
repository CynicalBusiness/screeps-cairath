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
            visualizePathStyle: { stroke: "#0000FF" },
        });
    }
}

export const STORAGE_PRIORITIES = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,
    STRUCTURE_CONTAINER,
    STRUCTURE_STORAGE,
];

export type StorageStructures =
    | StructureSpawn
    | StructureExtension
    | StructureTower
    | StructureContainer
    | StructureStorage;

export function getStorages<R extends ResourceConstant>(
    room: Room,
    resource: R,
    filter: (st: StorageStructures) => boolean,
    reversePriority: boolean = false
): StorageStructures[] {
    const storages = _.sortBy(
        room.find(FIND_STRUCTURES, {
            filter: (st) =>
                (st instanceof StructureSpawn ||
                    st instanceof StructureExtension ||
                    st instanceof StructureTower ||
                    st instanceof StructureContainer ||
                    st instanceof StructureStorage) &&
                filter(st) &&
                ((st instanceof OwnedStructure && st.my) ||
                    (room.controller && room.controller.my)),
        }) as StorageStructures[],
        (st) => STORAGE_PRIORITIES.indexOf(st.structureType)
    );
    if (reversePriority) _.reverse(storages);
    return storages;
}

export function getStorage<R extends ResourceConstant>(
    room: Room,
    resource: R,
    filter: (st: StorageStructures) => boolean,
    reversePriority: boolean = false
): StorageStructures | undefined {
    return getStorages(room, resource, filter, reversePriority)[0];
}

export function getStorageWithAvailableSpace<
    TResource extends ResourceConstant
>(room: Room, resource: TResource) {
    return getStorage(
        room,
        resource,
        (st) =>
            ((st.store as any) as Store<TResource, false>).getFreeCapacity(
                resource
            ) > 0
    );
}

export function getStorageWithAvailableResource(
    room: Room,
    resource: ResourceConstant,
    ignoreSpawnIfOthersAvailable: boolean = true
) {
    const storages = getStorages(
        room,
        resource,
        (st) =>
            !(st instanceof StructureTower) &&
            !_.isNil(st.store[resource]) &&
            st.store[resource] > 0,
        true
    );
    if (ignoreSpawnIfOthersAvailable) {
        const storagesWithoutSpawns = _.filter(
            storages,
            (st) =>
                !(
                    st instanceof StructureSpawn ||
                    st instanceof StructureExtension
                )
        );
        return (storagesWithoutSpawns.length > 0
            ? storagesWithoutSpawns
            : storages)[0];
    } else return storages[0];
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
                    creep.say("🔋");
            }

            return true;
        }
    }
    return false;
}
