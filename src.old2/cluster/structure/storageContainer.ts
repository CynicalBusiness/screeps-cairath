import _ from "lodash";
import { StorageType, CacheType } from "../../const";
import { cached } from "../../util/decorators";
import { StorageManager, StorageManagerOptions } from "./storage";

export default class ContainerStorageManager<
    TContainer extends StructureContainer = StructureContainer
> extends StorageManager<TContainer> {
    public constructor(container: TContainer, options?: StorageManagerOptions) {
        super(container, options);
        if (this.isMiningContainer() || this.isSpawnContainer())
            this.storageType = StorageType.OUTPUT;
    }

    // @cached(CacheType.RUNTIME)
    public isMiningContainer(): boolean {
        return !!(
            _.first(this.object.pos.findInRange(FIND_SOURCES, 1)) ??
            _.first(this.object.pos.findInRange(FIND_MINERALS, 1))
        );
    }

    // @cached(CacheType.RUNTIME)
    public isSpawnContainer(): boolean {
        return !!_.first(this.object.pos.findInRange(FIND_MY_SPAWNS, 1));
    }
}
