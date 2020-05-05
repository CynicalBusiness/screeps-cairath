import _ from "lodash";

// TODO replace this with the event pipeline
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
