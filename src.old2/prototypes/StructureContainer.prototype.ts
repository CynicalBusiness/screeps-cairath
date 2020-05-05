import _ from "lodash";
import ContainerStorageManager from "../cluster/structure/storageContainer";

declare global {
    interface StructureContainer {
        storage: ContainerStorageManager<this>;
    }
}

Object.defineProperties(StructureContainer.prototype, {
    storage: {
        get: _.memoize(function (this: StructureContainer) {
            return new ContainerStorageManager(this);
        }),
    },
});
