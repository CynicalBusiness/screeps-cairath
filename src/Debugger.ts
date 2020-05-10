import _ from "lodash";
import format from "string-format";
import { AbstractGameCoreObject } from "./game";
import { CONST } from "./game/GameCore";

export class Debugger extends AbstractGameCoreObject {
    /**
     * Creates an array of text visuals for displaying in the debugger. The message is trimmed then split by line-break
     * characters (`\n`); each line then gets its own text visual.
     * @param x X position of first line
     * @param y Y position of first line
     * @param message The message to display
     * @param options Text styling options
     * @param lineHeight Height of each line
     */
    public static createTextVisuals(
        x: number,
        y: number,
        message: string,
        options?: TextStyle,
        lineHeight: number = CONST.STATS_SIZE
    ): Debug.VisualArgumentsText[] {
        const opts: TextStyle = {
            font: `${CONST.STATS_SIZE} monospace`,
            align: "left",
            opacity: 0.5,
            ...options,
        };
        return _(message.trim().split(/\n/g))
            .map(
                (line, ln): Debug.VisualArgumentsText => [
                    "text",
                    [line, x, y + ln * lineHeight, opts],
                ]
            )
            .value();
    }

    /**
     * Creates a rectangular highlight on a given tile
     * @param pos The tile position to highlight
     * @param color The color
     * @param options Any additional options
     */
    public static createTileHighlightVisual(
        pos: RoomPosition,
        color: string,
        options?: PolyStyle
    ): Debug.VisualArgumentsRect {
        return [
            "rect",
            [
                pos.x - 0.5,
                pos.y - 0.5,
                1,
                1,
                { fill: color, opacity: 0.25, ...options },
            ],
        ];
    }

    private _options: Partial<Record<Debug.Option, Debug.Producer[]>> = {};

    public get memory(): Debug.Memory {
        return (Memory.debug = Memory.debug ?? {});
    }

    public get options(): Debug.Options {
        return (this.memory.options = this.memory.options ?? {});
    }

    public log(message: string, formatArgs?: _.Dictionary<any>): void {
        return this.game.log(message, formatArgs, "Debugger");
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
        (this._options[option] = this._options[option] ?? []).push(
            ...producers
        );
        return this;
    }

    /**
     * Enables a debug option, or all if no option is provided
     * @param option The option
     */
    public enable(option?: Debug.Option): void {
        if (option) this.options[option] = true;
        else _.each(CONST.DEBUG_OPTIONS, (opt) => this.enable(opt));
        this.log("Enabled: " + (option ?? "All"));
    }

    /**
     * Disables a debug option, or all if no option is provided
     * @param option The option
     */
    public disable(option?: Debug.Option): void {
        if (option) delete this.options[option];
        else delete this.memory.options;
        this.log("Disabled: " + (option ?? "All"));
    }

    public has(option: Debug.Option): boolean {
        return !!this.options[option];
    }

    public init(): void {
        this.log(
            "Enabled Options: " +
                (_(this.options)
                    .pickBy((opt) => opt)
                    .keys()
                    .join(",") || "None")
        );

        // TODO limit what rooms this is displayed in instead of "Game.rooms"
        _.each(Game.rooms, (room) => {
            this.register("Stats", () => {
                const now = new Date();
                return [
                    room,
                    [
                        ...Debugger.createTextVisuals(
                            0,
                            0,
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
                            })
                        ),
                    ],
                ];
            });
        });
    }

    public loop(): void {
        _.each(this._options, (producers, option) => {
            if (producers && this.has(option as Debug.Option)) {
                _(producers)
                    .map((producer) => producer())
                    .each(([room, visuals]) => {
                        _.each(visuals, (args) => {
                            switch (args[0]) {
                                case "text":
                                    return room.visual.text(
                                        ...(args[1] as Parameters<
                                            RoomVisual["text"]
                                        >)
                                    );
                                case "line":
                                    return room.visual.line(...args[1]);
                                case "rect":
                                    return room.visual.rect(
                                        ...(args[1] as Parameters<
                                            RoomVisual["rect"]
                                        >)
                                    );
                            }
                        });
                    });
            }
        });
    }
}
