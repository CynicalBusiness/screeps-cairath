import _ from "lodash";
import format from "string-format";
import { AbstractGameCoreObject } from "./game";
import { CONST } from "./game/GameCore";

export class Debugger extends AbstractGameCoreObject {
    #options: Partial<Record<Debug.Option, Debug.Producer[]>> = {};

    public get config(): Debug.Config {
        return (Memory.debug = Memory.debug ?? {});
    }

    /**
     * Registers stat producers to this debugger under the given option
     * @param option The option in which to use these producers
     * @param producers The producers
     */
    public register(
        option: Debug.Option,
        ...producers: Debug.Producer[]
    ): this {
        (this.#options[option] = this.#options[option] ?? []).push(
            ...producers
        );
        return this;
    }

    /**
     * Enables a debug option, or all if no option is provided
     * @param option The option
     */
    public enable(option?: Debug.Option): void {
        if (option) this.config[option] = true;
        else _.each(CONST.DEBUG_OPTIONS, (opt) => this.enable(opt));
    }

    /**
     * Disables a debug option, or all if no option is provided
     * @param option The option
     */
    public disable(option?: Debug.Option): void {
        if (option) delete this.config[option];
        else delete Memory.debug;
    }

    public has(option: Debug.Option): boolean {
        return !!this.config[option];
    }

    public init(): void {
        // TODO limit what rooms this is displayed in instead of "Game.rooms"
        _.each(Game.rooms, (room) => {
            this.register("Stats", (): Debug.DebugDisplay[] => {
                const now = new Date();
                return [
                    [
                        new RoomPosition(0, 0, room.name),
                        format(CONST.STATS_FORMAT, {
                            tick: Game.time,
                            deltaTick: Game.time - Memory.lastReload,
                            time: now.toISOString(),
                            tickrate: now.getTime() - Memory.lastTickTime,
                            cpuUsed: Memory.cpu.used,
                            cpuLimit: Memory.cpu.limit,
                            cpuTickLimit: Memory.cpu.tickLimit,
                            cpuBucket: Memory.cpu.bucket,
                            roomName: room.name,
                            shardName: Game.shard.name,
                            shardType: Game.shard.type,
                            shardPTR: Game.shard.ptr ? "yes" : "no",
                        }),
                    ],
                ];
            });
        });
    }

    public loop(): void {
        _.each(this.#options, (producers, option) => {
            if (producers && this.has(option as Debug.Option)) {
                _(producers)
                    .flatMap((producer) => producer())
                    .each(([{ room, x, y }, text]) => {
                        if (room) {
                            _.each(text.trim().split(/\n/g), (line, ln) =>
                                room.visual.text(
                                    line,
                                    x,
                                    y + ln * CONST.STATS_SIZE,
                                    {
                                        font: `${CONST.STATS_SIZE} monospace`,
                                        align: "left",
                                        opacity: 0.5,
                                    }
                                )
                            );
                        }
                    });
            }
        });
    }
}
