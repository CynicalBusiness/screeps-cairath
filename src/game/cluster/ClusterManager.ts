import _ from "lodash";
import { AbstractGameCoreObject } from "../AbstractGameCoreObject";
import { Cluster } from "./Cluster";

/**
 * Manager singleton for all clusters
 */
export class ClusterManager extends AbstractGameCoreObject {
    #cluster: _.Dictionary<Cluster> = {};

    /** Cluster memory */
    public get memory(): _.Dictionary<Cluster.Memory> {
        return (Memory.clusters = Memory.clusters ?? {});
    }

    public claim(room: string, clusterName: string = room): Cluster {
        if (this.#cluster[clusterName]) {
            const cluster = this.#cluster[clusterName];
            cluster.claim(room);
            return cluster;
        } else {
            this.memory[clusterName] = { headquarters: room };
            const cluster = new Cluster(clusterName);
            this.#cluster[clusterName] = cluster;
            return cluster;
        }
    }

    public log(message: string, formatData?: any, prefix?: string): void {
        this.game.log(
            message,
            formatData,
            "Cluster" + (prefix ? ":" + prefix : "")
        );
    }

    public init(): void {
        _.each(
            _.keys(this.memory),
            (name) => (this.#cluster[name] = new Cluster(name))
        );
    }
}
