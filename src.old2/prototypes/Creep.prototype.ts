import { CynClusterManager } from "../cluster/cluster";
import { CreepBrain } from "../cluster/creep/brain";

declare global {
    /** Type extensions for creep */
    interface Creep {
        cluster?: CynClusterManager;
        isManaged(this: Creep): this is CynCluster.Creep.ClusterCreep;

        /**
         * Tells a creep to move to a spot, but ignore couriers when moving
         * @param args
         */
        moveToIgnoringCouriers(
            ...args: Parameters<Creep["moveTo"]>
        ): ScreepsReturnCode;
    }
}

Object.defineProperties(Creep.prototype, {
    clusterMemory: {
        get(this: Creep): CynCluster.Memory.ClusterCreepMemory | undefined {
            return this.isManaged()
                ? this.cluster.getCreepMemory(this.name)
                : undefined;
        },
    },
    cluster: {
        get(this: Creep): CynClusterManager | undefined {
            return GameCore.getClusterForCreep(this);
        },
    },
    brain: {
        get(this: Creep): CreepBrain | undefined {
            if (this.isManaged() && this.clusterMemory.role) {
                return this.cluster.creepController.brains[
                    this.clusterMemory.role
                ];
            } else return undefined;
        },
    },
    task: {
        get(this: Creep): CynCluster.Task.Object.Any | undefined {
            return this.isManaged() ? this.clusterMemory.task : undefined;
        },
    },
});

Creep.prototype.isManaged = function (this: Creep): boolean {
    return CynClusterManager.isClusterManaged(this);
};
