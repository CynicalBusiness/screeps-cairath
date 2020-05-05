import _ from "lodash";
import StorageStorageManager from "../cluster/structure/storageStorage";

declare global {
    interface StructureStorage {
        storage: StorageStorageManager<this>;
    }
}

Object.defineProperties(StructureStorage.prototype, {
    storage: {
        get: _.memoize(function (this: StructureStorage) {
            return new StorageStorageManager(this);
        }),
    },
});
