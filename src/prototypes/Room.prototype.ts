import _ from "lodash";
import { CynClusterManager } from "../cluster/cluster";
import { TaskPriority } from "../cluster/task/delegator";

declare global {
    interface AppropriateStorageOptions<
        TResource extends ResourceConstant = ResourceConstant
    > {
        resource: TResource;
        amount: number;
    }

    interface Room {
        cluster?: CynClusterManager;

        /** Priorities for storages, where higher priorities are added to first and taken from last */
        storagePriorities: Partial<Record<StructureConstant, number>>;

        /**
         * Finds a parking flag in a given room
         */
        findParkingFlag(): Flag | undefined;

        /**
         * Gets an array appropriate storages for pickup for drop-off, optionally filtered by only structures which can
         * take the given resource. If an amount is provided, only structures with enough free space or available
         * resource will be returned
         * @param intention The intention to drop off or pick up
         * @param options Options for the search
         */
        findAppropriateStorages<TResource extends ResourceConstant>(
            intention: "dropoff" | "pickup",
            options?: Partial<AppropriateStorageOptions<TResource>>
        ): OwnedStructureWithStorage<TResource>[];

        /**
         * Finds an appropriate storage for pickup for drop-off, optionally filtered by only structures which can take
         * the given resource. If an amount is provided, only structures with enough free space or available resource
         * will be returned
         * @param intention The intention to drop off or pick up
         * @param options Options for the search
         */
        findAppropriateStorage<TResource extends ResourceConstant>(
            intention: "dropoff" | "pickup",
            options?: Partial<AppropriateStorageOptions<TResource>>
        ): OwnedStructureWithStorage<TResource> | undefined;
    }
}

Object.defineProperties(Room.prototype, {
    cluster: {
        get(this: Room): CynClusterManager | undefined {
            return GameCore.getClusterForRoom(this.name);
        },
    },
    storagePriorities: {
        value: {
            [STRUCTURE_SPAWN]: TaskPriority.HIGHEST,
            [STRUCTURE_EXTENSION]: TaskPriority.HIGH,
            [STRUCTURE_CONTAINER]: TaskPriority.LOW,
            [STRUCTURE_STORAGE]: TaskPriority.LOWEST,
        },
    },
});

Room.prototype.findParkingFlag = function (this: Room): Flag | undefined {
    return _.chain(this.find(FIND_FLAGS))
        .filter((flag) => flag.name.startsWith("Parking"))
        .first()
        .value();
};

Room.prototype.findAppropriateStorages = function <
    TResource extends ResourceConstant
>(
    this: Room,
    intention: "dropoff" | "pickup",
    { resource, amount }: Partial<AppropriateStorageOptions<TResource>> = {}
): OwnedStructureWithStorage<TResource>[] {
    // TODO respect reservations
    // TODO ignore mining containers

    return _.chain(this.find(FIND_MY_STRUCTURES))
        .filter((s): s is OwnedStructureWithStorage<TResource> =>
            s.hasStorage(resource)
        )
        .filter((s) => {
            if (typeof amount !== "number" || amount <= 0) amount = 1;
            switch (intention) {
                case "dropoff":
                    return s.store.getFreeCapacity(resource) >= amount;
                case "pickup":
                    return s.store.getUsedCapacity(resource) >= amount;
            }
        })
        .sortBy((s) => this.storagePriorities[s.structureType] ?? -1)
        .value();
};

Room.prototype.findAppropriateStorage = function <
    TResource extends ResourceConstant
>(
    intention: "dropoff" | "pickup",
    options?: Partial<AppropriateStorageOptions<TResource>>
): OwnedStructureWithStorage<TResource> | undefined {
    return this.findAppropriateStorages(intention, options)[0];
};
