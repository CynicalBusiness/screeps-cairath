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

        /** Priorities for construction, where higher priorities are assigned first. Anything not in this list is assumed at {@link TaskPriority.NORMAL}. */
        constructionPriorities: Partial<
            Record<BuildableStructureConstant, number>
        >;

        /** Priorities for repair, where higher priorities are assigned first. Anything not in this list is assumed at {@link TaskPriority.NORMAL}. */
        repairPriorities: Partial<Record<StructureConstant, number>>;

        /**
         * Finds a parking flag in a given room
         */
        findParkingFlag(): Flag | undefined;

        findStorages<TResource extends ResourceConstant>(
            resource?: TResource
        ): StructureWithStorage<TResource>[];

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
        ): StructureWithStorage<TResource>[];

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
        ): StructureWithStorage<TResource> | undefined;
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
    constructionPriorities: {
        value: {
            [STRUCTURE_WALL]: TaskPriority.HIGHEST,
            [STRUCTURE_RAMPART]: TaskPriority.HIGHEST,
            [STRUCTURE_ROAD]: TaskPriority.HIGH,
        },
    },
    repairPriorities: {
        value: {
            [STRUCTURE_ROAD]: TaskPriority.LOW,
        },
    },
});

Room.prototype.findParkingFlag = function (this: Room): Flag | undefined {
    return _.chain(this.find(FIND_FLAGS))
        .filter((flag) => flag.name.startsWith("Parking"))
        .first()
        .value();
};

Room.prototype.findStorages = function <TResource extends ResourceConstant>(
    this: Room,
    resource?: TResource
): StructureWithStorage<TResource>[] {
    return (_.filter(this.find(FIND_STRUCTURES), (s) =>
        s.hasStorage(resource)
    ) as any) as StructureWithStorage<TResource>[];
};

Room.prototype.findAppropriateStorages = function <
    TResource extends ResourceConstant
>(
    this: Room,
    intention: "dropoff" | "pickup",
    { resource, amount }: Partial<AppropriateStorageOptions<TResource>> = {}
): StructureWithStorage<TResource>[] {
    // TODO respect reservations

    const chain = _.chain(this.findStorages(resource))
        .filter(
            (s) =>
                // ignore mining containers
                s.structureType !== STRUCTURE_CONTAINER ||
                !((s as any) as StructureContainer).isMiningContainer
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
        .sortBy((s) => this.storagePriorities[s.structureType] ?? -1);

    return intention === "dropoff" ? chain.reverse().value() : chain.value();
};

Room.prototype.findAppropriateStorage = function <
    TResource extends ResourceConstant
>(
    intention: "dropoff" | "pickup",
    options?: Partial<AppropriateStorageOptions<TResource>>
): StructureWithStorage<TResource> | undefined {
    return this.findAppropriateStorages(intention, options)[0];
};
