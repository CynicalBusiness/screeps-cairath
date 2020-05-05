import _ from "lodash";
import { Priority, StorageType, CacheType } from "../../const";
import { cached } from "../../util/decorators";
import { CynClusterManager } from "../cluster";

export type StorageManagerOptions = {
    priority: Priority;
    type: StorageType;
};

/**
 * Manager for storages on a given an object
 */
export class StorageManager<
    TObject extends RoomObjectWithStorage<TResource>,
    TResource extends ResourceConstant = ResourceConstant
> {
    /**
     * Cluster object associated with this manager
     */
    public readonly cluster: CynClusterManager;

    /**
     * The object associated with this manager
     */
    public readonly object: TObject;

    /** Storage priority for this object */
    public priority: Priority;

    /** The storage type for this object */
    public storageType: StorageType;

    // TODO ratios per resource

    private cacheResolved: Partial<Record<TResource, number>> = {};
    #cachePerCreep:
        | _.Dictionary<
              [number, CynCluster.Storage.PendingAccessReservation<TResource>][]
          >
        | undefined;

    public constructor(
        object: TObject,
        { priority, type }: Partial<StorageManagerOptions> = {}
    ) {
        this.object = object;

        this.priority =
            priority ??
            (object.room && object instanceof Structure
                ? object.room.storagePriorities[object.structureType]
                : undefined) ??
            Priority.NORMAL;
        this.storageType = type ?? StorageType.GENERAL;

        if (!object.room)
            throw new Error(
                "Cannot create storage manager for object in a non-visible room"
            );
        const cluster = GameCore.getClusterForRoom(object.room.name);
        if (!cluster)
            throw new Error(
                "Cannot create storage manager for room not managed by cluster"
            );
        this.cluster = cluster;
    }

    private get pending(): CynCluster.Storage.PendingAccessReservation<
        TResource
    >[] {
        const storageReservations = (this.cluster.memory.storageReservations =
            this.cluster.memory.storageReservations ?? {});
        return (storageReservations[this.object.id] =
            storageReservations[this.object.id] ??
            []) as CynCluster.Storage.PendingAccessReservation<TResource>[];
    }

    /** The store belonging to this manger's object */
    public get store(): Store<TResource, false> {
        return this.object.store;
    }

    /** Pending access reservations */
    public get reservations(): Readonly<
        CynCluster.Storage.PendingAccessReservation<TResource>
    >[] {
        return _.values(this.pending);
    }

    /**
     * Gets all resources this storage can hold
     */
    @cached(CacheType.RUNTIME)
    public getStoreResources(): TResource[] {
        return _.filter(
            RESOURCES_ALL,
            (res): res is TResource => this.store.getUsedCapacity(res) !== null
        );
    }

    /**
     * Gets the first available resource in this storage
     */
    public getFirstAvailableResource(): [TResource, number] | undefined {
        for (const res of this.getStoreResources()) {
            const used = this.getEffectiveAmount(res);
            if (used > 0) return [res, used];
        }
        return undefined;
    }

    /**
     * Gets the effective amount of a resource after all accesses are completed
     * @param resource The resource to resolve
     * @param until If provided, calculation will stop at the given index
     */
    public getEffectiveAmount(resource?: TResource, until?: number): number {
        if (resource)
            return (this.cacheResolved[resource] =
                this.cacheResolved[resource] ??
                this.store[resource] +
                    _.chain(this.pending)
                        .take(until)
                        .filter((p) => p.resource === resource)
                        .sumBy((p) => p.amount)
                        .value());
        else
            return _.sumBy(this.getStoreResources(), (res) =>
                this.getEffectiveAmount(res, until)
            );
    }

    /**
     * Gets the first unresolved access belonging to a given creep
     * @param creep The creep's ID to check for
     */
    public getAccessByCreep(
        creep: Id<Creep>
    ):
        | Readonly<CynCluster.Storage.PendingAccessReservation<TResource>>
        | undefined {
        return this.getAccessIndexByCreep(creep)?.[1];
    }

    /**
     * Returns whether or not an access is "safe". That is, whether or not a given access can be done immediately, or
     * otherwise has to wait for other accesses to resolve.
     * @param resource The resource to check
     * @param amount The amount to check
     * @param until If provided, calculation will stop at the given index
     */
    public isAccessSafe(
        resource: TResource,
        amount: number,
        until?: number
    ): boolean {
        if (amount === 0) return false;
        const effective = this.getEffectiveAmount(resource, until);
        return amount < 0
            ? effective >= Math.abs(amount)
            : effective + amount <= this.store.getCapacity(resource);
    }

    /**
     * Attempts to resolve a storage access to this manager's storage. In addition to the return codes for `transfer`
     * and `withdraw`, this method can also return additional error codes:
     * * `ERR_TIRED` - This creep cannot access the storage until previous pending accesses are resolved
     * * `ERR_NO_PATH` - The previous resolution is no longer valid (such as use of {@link #forgot}) and should be re-requested
     * * `ERR_NOT_FOUND` - The creep has no requested accesses pending
     * @param creep The creep to attempt to resolve
     */
    public resolve(creep: Creep): ScreepsReturnCode {
        if (!creep.pos.inRangeTo(this.object.pos, 1)) return ERR_NOT_IN_RANGE;

        const access = this.getAccessIndexByCreep(creep.id);
        if (!access) return ERR_NOT_FOUND;

        const [idx, pending] = access;
        if (!this.isAccessSafe(pending.resource, pending.amount, idx))
            return ERR_TIRED;

        // TODO verify this transaction can actually happen
        return creep[pending.amount < 0 ? "withdraw" : "transfer"](
            (this.object as any) as Structure,
            pending.resource,
            Math.abs(pending.amount)
        );
    }

    /**
     * Forgets all reservations from a given creep. This is forceful, and should only be used if necessary, such as in
     * the event of creep death.
     * @param creep The creep to forget
     */
    public forget(creep: Id<Creep>): void {
        while (this.removeResolution(creep));
    }

    private getAccessIndexByCreep(
        creep: Id<Creep>
    ):
        | [
              number,
              Readonly<CynCluster.Storage.PendingAccessReservation<TResource>>
          ]
        | undefined {
        const accesses = (this.#cachePerCreep =
            this.#cachePerCreep ??
            _.chain(this.pending)
                .map((p, i): [
                    number,
                    CynCluster.Storage.PendingAccessReservation<TResource>
                ] => [i, p])
                .groupBy(([, p]) => p.by)
                .value());
        return accesses[creep]?.[0];
    }

    private removeResolution(creep: Id<Creep>): boolean {
        this.flushCache();
        const idx = _.findIndex(this.pending, (p) => p.by === creep);
        if (idx >= 0) {
            // TODO do something about resolutions further in the list that are now potentially invalid
            this.pending.splice(idx, 1);
            return true;
        } else return false;
    }

    private flushCache(): void {
        this.cacheResolved = {};
        this.#cachePerCreep = undefined;
    }
}
