import _ from "lodash";
import { CynClusterManager } from "../cluster";
import { CreepBrain } from "./brain";
import { BuilderBrain } from "./brains/builder";
import { CourierBrain } from "./brains/courier";
import { HarvesterBrain } from "./brains/harvester";
import { UpgraderBrain } from "./brains/upgrader";

/**
 * Controller for creeps in cluster
 */
export class CynCreepController {
    public readonly cluster: CynClusterManager;

    public readonly brains: Readonly<
        { [R in CynCluster.Creep.ROLE_ANY]: CreepBrain<R> }
    >;

    public constructor(cluster: CynClusterManager) {
        this.cluster = cluster;

        this.brains = {
            Harvester: new HarvesterBrain(this),
            Courier: new CourierBrain(this),
            Upgrader: new UpgraderBrain(this),
            Builder: new BuilderBrain(this),
        };
    }

    /**
     * Gets the numbers of needed creeps for a given role
     */
    public getNeededCreeps(): Partial<CynCluster.Creep.RoleDictionary<number>> {
        // TODO sort this somehow
        return {
            Harvester: 6,
            Courier: 5,
            Upgrader: 3,
            Builder: 2,
        };
    }

    public act(creep: CynCluster.Creep.ClusterCreep): void {
        creep.clusterMemory.task = creep.brain.act(creep);
    }

    public actAll(): void {
        _.each(this.cluster.creeps, (creep) => this.act(creep));
    }

    public updatePendingTasks(): void {
        _.each(_.values(this.brains), (b) => b.updatePendingTasks());
    }
}
