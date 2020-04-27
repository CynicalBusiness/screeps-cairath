import { TaskDelegator, TaskPriority } from "../delegator";

export class SourceHarvestTaskDelegator extends TaskDelegator<
    CynCluster.Task.Object.HarvestSource
> {
    public findWork(): CynCluster.Task.Object.HarvestSource[] {
        const work: CynCluster.Task.Object.HarvestSource[] = [];

        for (const source of this.cluster.getSources()) {
            if (source.cluster === this.cluster) {
                const sourceMemory = this.cluster.getSourceMemory(source.id);
                const miners = (sourceMemory.miners =
                    sourceMemory.miners ?? {});

                for (const pos of source.getWalkableNeighbors()) {
                    const miner = (miners[pos.toString()] = miners[
                        pos.toString()
                    ] ?? { offsetX: pos.x, offsetY: pos.y });

                    // clear the old miner if it is invalid
                    if (miner.miner) {
                        const creep = Game.getObjectById(miner.miner);
                        if (
                            !creep ||
                            !creep.isManaged() ||
                            creep.task.type !== "HarvestSource" ||
                            creep.task.source !== source.id
                        )
                            delete miner.miner;
                    }

                    if (!miner.miner) {
                        work.push({
                            type: "HarvestSource",
                            priority: TaskPriority.HIGH,
                            from: pos,
                            fromStr: pos.toString(),
                            source: source.id,
                        });
                    }
                }
            }
        }

        return work;
    }
}
