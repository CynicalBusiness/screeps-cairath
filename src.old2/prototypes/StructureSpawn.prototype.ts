import _ from "lodash";
import { CreepBrain } from "../cluster/creep/brain";
import SpawnStorageManager from "../cluster/structure/storageSpawn";

declare global {
    interface StructureSpawn {
        _storage?: SpawnStorageManager<this>;

        /** Storage manager for this spawn */
        storage: SpawnStorageManager<this>;

        pendingSpawn: boolean;

        spawnClusterCreep<TRole extends CynCluster.Creep.ROLE_ANY>(
            role: TRole,
            sizeTier: number,
            options?: SpawnOptions
        ): ScreepsReturnCode;
    }
}

Object.defineProperties(StructureSpawn.prototype, {
    storage: {
        get(this: StructureSpawn) {
            return (this._storage =
                this._storage ?? new SpawnStorageManager(this));
        },
    },
});

StructureSpawn.prototype.spawnClusterCreep = function <
    TRole extends CynCluster.Creep.ROLE_ANY
>(
    this: StructureSpawn,
    role: TRole,
    size: number,
    options?: SpawnOptions
): ScreepsReturnCode {
    const { cluster } = this.room;
    if (cluster) {
        if (this.spawning || this.pendingSpawn) return ERR_BUSY;
        const name =
            role +
            _.padStart(size.toString(), 3, "0") +
            "-" +
            cluster.name +
            "-" +
            Game.time.toString(16);
        const spawnResult = this.spawnCreep(
            cluster.creepController.brains[role].getBodyParts(size),
            name,
            options
        );
        if (spawnResult === OK) {
            if (!options?.dryRun) {
                this.pendingSpawn = true;
                GameCore.registerNextTick(() => {
                    const creep = this.spawning as Spawning;
                    console.log(`* spawning: ${creep.name} at ${this.id}`);
                    const memory = cluster.getCreepMemory(creep.name);
                    memory.role = role;
                    memory.task = CreepBrain.createIdleTask(this.room);
                    this.pendingSpawn = false;
                });
            }
            return OK;
        } else return spawnResult;
    } else return ERR_INVALID_TARGET;
};
