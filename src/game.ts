import "./types";
import "./prototypes";
import _ from "lodash";
import { CynClusterManager } from "./cluster/cluster";
import { GameLoopConsumer } from "./util";

export class CynGame extends GameLoopConsumer {
    public static load(): CynGame {
        console.log("Game loaded:", new Date().toISOString());
        return new CynGame();
    }

    public clusters: Readonly<CynClusterManager[]>;

    #pendingNextTick: (() => any)[] = [];

    private constructor() {
        super();
        this.clusters = [
            CynClusterManager.create(this, "home", {
                homeRoom: "E5S1",
            }),
        ];
    }

    public getClusterForCreep(creep: Creep): CynClusterManager | undefined {
        return _.find(this.clusters, (c) => !!c.memory.creeps[creep.name]);
    }

    public getClusterForRoom(roomName: string): CynClusterManager | undefined {
        return _.find(this.clusters, (c) => c.roomNames.includes(roomName));
    }

    /**
     * Registers a callback to invoke on the next tick
     * @param callback The callback
     */
    public registerNextTick(callback: () => any): void {
        this.#pendingNextTick.push(callback);
    }

    public onLoop(): void {
        _.each(this.#pendingNextTick, (c) => {
            try {
                c();
            } catch (err) {
                console.log("error when processing nextTick callback:", err);
            }
        });
        this.#pendingNextTick = [];

        // clean up memory for dead non-cluster creeps
        for (const name of Object.keys(Memory.creeps)) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    }
}
