import { StorageManager } from "./storage";

export default class StorageStorageManager<
    TStorage extends StructureStorage = StructureStorage
> extends StorageManager<TStorage> {}
