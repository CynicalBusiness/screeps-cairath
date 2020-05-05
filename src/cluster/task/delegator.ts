import { CynClusterManager } from "../cluster";

export abstract class TaskDelegator<
    TTaskTypes extends CynCluster.Task.Object.Any = CynCluster.Task.Object.Any
> {
    public readonly cluster: CynClusterManager;

    public constructor(cluster: CynClusterManager) {
        this.cluster = cluster;
    }

    public abstract findWork(): TTaskTypes[];
}
