export * as CONST from "../const";

import _ from "lodash";
import { Observable, Subject } from "rxjs";
import Format from "string-format";
import { name, version } from "../../package.json";
import { Debugger } from "../Debugger";
import { INIT_MESSAGE } from "../const";
import { ofType } from "../utils";
import { AbstractGameCoreObject } from "./AbstractGameCoreObject";
import { ClusterManager } from "./cluster";

/**
 * Main game class
 */
export class GameCore {
    private static _instance: GameCore;

    /**
     * Gets the current {@link GameCore} instance
     */
    public static get(): GameCore {
        return (GameCore._instance = GameCore._instance ?? new GameCore());
    }

    /** Observable for any event emissions */
    public readonly event$: Observable<Event.Type.Any>;

    /** Observable fired once per tick */
    public readonly tick$: Observable<Event.Type.Tick>;

    #event$ = new Subject<Event.Type.Any>();
    #objects: _.Dictionary<AbstractGameCoreObject> = {};

    private constructor() {
        console.log(
            Format(INIT_MESSAGE, {
                name,
                version,
                isoDate: new Date().toISOString(),
                deltaTicks: Game.time - (Memory.lastReload ?? 0),
            })
        );
        Memory.lastReload = Game.time;

        this.event$ = this.#event$.asObservable();
        this.tick$ = this.event$.pipe(ofType("Tick"));
    }

    public get Debugger(): Debugger {
        return this.objects["Debugger"] as Debugger;
    }

    public get ClusterManager(): ClusterManager {
        return this.objects["ClusterManager"] as ClusterManager;
    }

    public get objects(): Readonly<_.Dictionary<AbstractGameCoreObject>> {
        return { ...this.#objects };
    }

    /** Logs a message to the console */
    public log(
        message: string,
        formatData?: any,
        prefix?: string,
        color?: string
    ): void {
        console.log(
            `<span style="color: ${
                color ?? "inherit"
            };vertical-align:top"><span style="font-size: 75%;opacity:0.6">[${prefix}]</span> ${Format(
                message,
                formatData
            )}</span>`
        );
    }

    /**
     * Attaches the given game core object
     * @param GCO The object to attach
     */
    public with(GCO: GameCoreObject): this {
        const obj = new GCO(this);
        this.tick$.subscribe(obj.loop.bind(obj));
        this.#objects[GCO.name] = obj;
        return this;
    }

    public next(event: Omit<Event.Type.Any, "tick">): void {
        this.#event$.next({ ...event, tick: Game.time });
    }

    public init(): this {
        _.each(this.#objects, (obj, name) => {
            this.log("Init " + name, undefined, "Core");
            obj.init();
        });
        return this;
    }

    public loop(): LoopFunction {
        return () => {
            this.next({ type: "Tick" });

            Memory.lastTickTime = Date.now();
            Memory.cpu = { ...Game.cpu, used: Game.cpu.getUsed() };
        };
    }
}
