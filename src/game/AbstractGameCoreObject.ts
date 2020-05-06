import { GameCore } from "./GameCore";

export abstract class AbstractGameCoreObject {
    public readonly game: GameCore;

    public constructor(game: GameCore) {
        this.game = game;
    }

    public init(): void {
        // no-op by default
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    public loop(tick: Event.Type.Tick): void {
        // no-op by default
    }
}
