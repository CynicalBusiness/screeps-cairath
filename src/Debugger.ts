import _ from "lodash";
import format from "string-format";
import { AbstractGameCoreObject } from "./game";
import { CONST } from "./game/GameCore";

export class Debugger extends AbstractGameCoreObject {
    public get config(): Partial<Debug.Config> {
        return (Memory.debug = Memory.debug ?? {});
    }

    public enableAll(): void {
        this.config.showStats = true;
    }

    public disableAll(): void {
        delete Memory.debug;
    }

    public init(): void {
        // set up debug stats
    }

    public loop(): void {
        const now = new Date();
        if (this.config.showStats) {
            const stats = format(CONST.STATS_FORMAT, {
                tick: Game.time,
                deltaTick: Game.time - Memory.lastReload,
                time: now.toISOString(),
                tickrate: now.getTime() - Memory.lastTickTime,
                cpuUsed: Memory.cpu.used,
                cpuLimit: Memory.cpu.limit,
                cpuTickLimit: Memory.cpu.tickLimit,
                cpuBucket: Memory.cpu.bucket,
                shardName: Game.shard.name,
                shardType: Game.shard.type,
                shardPTR: Game.shard.ptr ? "yes" : "no",
            });

            _.each(stats.trim().split(/\n/g), (line, ln) =>
                _.each(Game.rooms, (room) =>
                    room.visual.text(line, 0, ln * CONST.STATS_SIZE, {
                        font: `${CONST.STATS_SIZE} monospace`,
                        align: "left",
                        opacity: 0.5,
                    })
                )
            );
        }
    }
}
