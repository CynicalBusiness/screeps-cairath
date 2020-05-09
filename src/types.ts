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
        clusters: _.Dictionary<Clusters.Memory>;
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
            | VisualArgumentsRect
            | VisualArgumentsLine
            | VisualArgumentsText;

        type VisualArgumentsLine = ["line", Parameters<RoomVisual["line"]>];

        type VisualArgumentsText =
            | ["text", [string, number, number, TextStyle]]
            | ["text", [string, RoomPosition, TextStyle]];

        type VisualArgumentsRect =
            | ["rect", [number, number, number, number, PolyStyle]]
            | ["rect", [RoomPosition, number, number, PolyStyle]];

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
