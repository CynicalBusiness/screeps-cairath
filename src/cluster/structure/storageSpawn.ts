import { StorageManager } from "./storage";

export default class SpawnStorageManager<
    TSpawn extends StructureSpawn = StructureSpawn
> extends StorageManager<TSpawn, RESOURCE_ENERGY> {}
