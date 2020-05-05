import { StorageManager } from "../cluster/structure/storage";
import { StorageType } from "../const";

declare global {
    interface StructureExtension {
        /** Storage manager for this object */
        storage: StorageManager<this, RESOURCE_ENERGY>;
    }
}

Object.defineProperties(StructureExtension.prototype, {
    storage: {
        get: function (
            this: StructureExtension
        ): StorageManager<StructureExtension, RESOURCE_ENERGY> {
            return new StorageManager(this, { type: StorageType.INPUT });
        },
    },
});
