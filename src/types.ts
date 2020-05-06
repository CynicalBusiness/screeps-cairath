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
        interface Config {
            showStats: boolean;
        }
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
