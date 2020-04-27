import _ from "lodash";

export abstract class GameLoopConsumer {
    #loopConsumers: GameLoopConsumer[] = [];

    public onLoop(): void {
        /* no-op */
    }

    public addLoopConsumer(consumer: GameLoopConsumer): this {
        this.#loopConsumers.push(consumer);
        return this;
    }

    public readonly loop = (): void => {
        this.onLoop();
        _.each(this.#loopConsumers, (c) => c.loop());
    };
}
