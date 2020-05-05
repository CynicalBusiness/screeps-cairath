import "lodash";

declare global {
    interface Structure {
        /**
         * Whether or not this structure has storage
         * @param res Optionally, a resource to filter by
         */
        hasStorage<TResource extends ResourceConstant>(
            res?: TResource
        ): this is StructureWithStorage<TResource>;

        hasManagedStorage<TResource extends ResourceConstant>(
            res?: TResource
        ): this is ManagedStorageObject<TResource>;
    }
}

Structure.prototype.hasStorage = function <TResource extends ResourceConstant>(
    res?: TResource
): boolean {
    const s = this as StructureWithStorage<TResource>;
    return !!s.store && (!res || s.store.getCapacity(res) !== null);
};

Structure.prototype.hasManagedStorage = function <
    TResource extends ResourceConstant
>(res?: TResource): boolean {
    const s = (this as any) as ManagedStorageObject<TResource>;
    return !!(this.hasStorage(res) && s.storage);
};
