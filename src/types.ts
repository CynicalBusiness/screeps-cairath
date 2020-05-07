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
        debug?: Partial<Debug.Config>;

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

        /** Debug configuration options */
        type Config = Partial<Record<Option, boolean>>;

        type DebugDisplay = [RoomPosition, string];

        type Producer = () => DebugDisplay[];
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
