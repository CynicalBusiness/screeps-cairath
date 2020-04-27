import { GameLoopConsumer } from "../util";
import { CynGame } from "../game";

export class CreepManager extends GameLoopConsumer {
    public readonly game: CynGame;

    public constructor(game: CynGame) {
        super();
        this.game = game.addLoopConsumer(this);
    }
}
