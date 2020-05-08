import "lodash";
import GameCore, { AbstractGameCoreObject } from "./game";

declare global {
    namespace NodeJS {
        interface Global {
            readonly GameCore: GameCore;
        }
    }

    // augmentations
    interface Memory {
        lastReload: number;
        lastTickTime: number;
        cpu: CPU & { used: number };

        debug?: Debug.Memory;
        clusters: _.Dictionary<Cluster.Memory>;
    }

    // types
    type LoopFunction = () => void;

    interface GameCoreObject<
        TType extends AbstractGameCoreObject = AbstractGameCoreObject
    > {
        new (game: GameCore): TType;
    }

    // Debug types
    namespace Debug {
        type Option = "Stats" | "Sources";

        type Memory = {
            statRooms?: string[];
            options?: Partial<Options>;
        };

        /** Debug configuration options */
        type Options = Partial<Record<Option, boolean>>;

        type DebugDisplay = [Room, VisualArguments[]];

        type VisualArguments =
            | ["rect", Parameters<RoomVisual["rect"]>]
            | ["line", Parameters<RoomVisual["line"]>]
            | ["text", [string, number, number, TextStyle]];

        type Producer = () => DebugDisplay;
    }

    namespace Event {
        namespace Type {
            interface AbstractEmpty<TType extends string> {
                type: TType;
                tick: number;
            }
            interface Abstract<TType extends string, TPayload>
                extends AbstractEmpty<TType> {
                payload: TPayload;
            }

            type Tick = AbstractEmpty<"Tick">;

            type Any = Tick;
        }
    }
}
