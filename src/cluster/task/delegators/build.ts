import _ from "lodash";
import { TaskDelegator, TaskPriority } from "../delegator";

export class ConstructionTaskDelegator extends TaskDelegator<
    CynCluster.Creep.RoleTasks["Builder"]
> {
    public findWork(): CynCluster.Creep.RoleTasks["Builder"][] {
        return [
            ..._.chain(this.cluster.findAll(FIND_MY_CONSTRUCTION_SITES))
                .reverse()
                .sortBy((site) => site.progressTotal)
                .map(
                    (site): CynCluster.Task.Object.WorkBuild => ({
                        type: "Build",
                        allowMultipleWorkers: true,
                        priority:
                            site.room?.constructionPriorities[
                                site.structureType
                            ] ?? TaskPriority.NORMAL,
                        target: site.id,
                    })
                )
                .value(),
            ..._.chain(this.cluster.findAll(FIND_STRUCTURES))
                .filter(
                    (s) =>
                        s.structureType === STRUCTURE_CONTAINER ||
                        !!(s as OwnedStructure).my
                )
                .filter((s) => s.hits < s.hitsMax)
                .sortBy((s) => s.hits)
                .map(
                    (s): CynCluster.Task.Object.WorkRepair => ({
                        type: "Repair",
                        priority:
                            s.hits < 100
                                ? TaskPriority.HIGHEST
                                : s.room.repairPriorities[s.structureType] ??
                                  TaskPriority.NORMAL,
                        target: s.id,
                        once: true,
                    })
                )
                .value(),
        ];
    }
}
