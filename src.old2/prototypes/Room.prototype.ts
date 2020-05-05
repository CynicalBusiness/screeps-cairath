import _ from "lodash";
import { CynClusterManager } from "../cluster/cluster";
import { Priority } from "../const";

declare global {
    interface AppropriateStorageOptions<
        TResource extends ResourceConstant = ResourceConstant
    > {
        resource: TResource;
        amount: number;
        proximity?: RoomPosition;
    }

    interface Room {
        cluster?: CynClusterManager;

        /** Priorities for storages, where higher priorities are added to first and taken from last */
        storagePriorities: Partial<Record<StructureConstant, Priority>>;

        /** Priorities for construction, where higher priorities are assigned first. Anything not in this list is assumed at {@link Priority.NORMAL}. */
        constructionPriorities: Partial<
            Record<BuildableStructureConstant, Priority>
        >;

        /** Priorities for repair, where higher priorities are assigned first. Anything not in this list is assumed at {@link Priority.NORMAL}. */
        repairPriorities: Partial<Record<StructureConstant, Priority>>;

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
            [STRUCTURE_SPAWN]: Priority.HIGHEST,
            [STRUCTURE_EXTENSION]: Priority.HIGH,
            [STRUCTURE_TOWER]: Priority.NORMAL,
            [STRUCTURE_CONTAINER]: Priority.LOW,
            [STRUCTURE_STORAGE]: Priority.LOWEST,
        },
    },
    constructionPriorities: {
        value: {
            [STRUCTURE_WALL]: Priority.HIGHEST,
            [STRUCTURE_RAMPART]: Priority.HIGHEST,
            [STRUCTURE_ROAD]: Priority.HIGH,
        },
    },
    repairPriorities: {
        value: {
            [STRUCTURE_ROAD]: Priority.LOW,
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
    {
        resource,
        amount,
        proximity,
    }: Partial<AppropriateStorageOptions<TResource>> = {}
): StructureWithStorage<TResource>[] {
    // TODO respect reservations

    let chain = _.chain(this.findStorages(resource))
        .filter(
            (s) =>
                // ignore mining containers
                (s.structureType !== STRUCTURE_CONTAINER ||
                    !((s as any) as StructureContainer).storage.isMiningContainer()) &&
                // ignore links
                s.structureType !== STRUCTURE_LINK
        )
        .filter((s) => {
            if (typeof amount !== "number" || amount <= 0) amount = 1;
            switch (intention) {
                case "dropoff":
                    return s.store.getFreeCapacity(resource) >= amount;
                case "pickup":
                    return (
                        s.structureType !== STRUCTURE_TOWER &&
                        s.store.getUsedCapacity(resource) >= amount
                    );
            }
        })
        .sortBy((s) => this.storagePriorities[s.structureType] ?? -1);

    if (proximity) chain = chain.sortBy((s) => s.pos.getRangeTo(proximity));

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
