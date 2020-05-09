import { AbstractGameCoreObject } from "../../AbstractGameCoreObject";
import { GameCore } from "../../GameCore";
import { Cluster } from "../Cluster";

/**
 * Generic abstract controller for a cluster
 */
export abstract class AbstractController implements AbstractGameCoreObject {
    /** The cluster this controller is associated with */
    public readonly cluster: Cluster;

    public constructor(cluster: Cluster) {
        this.cluster = cluster;
    }

    public get game(): GameCore {
        return this.cluster.manager.game;
    }

    public setup(): this {
        this.game.tick$.subscribe((tick) => this.loop(tick));
        this.init();
        return this;
    }

    public init(): void {
        // default no-op
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public loop(tick: Event.Type.Tick): void {
        // default no-op
    }
}
