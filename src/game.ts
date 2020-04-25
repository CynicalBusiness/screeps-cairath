import "./types";

export class CynGame {
    public static load(): CynGame {
        console.log("Game loaded:", new Date().toISOString());
        return new CynGame();
    }

    private constructor() {
        // TODO
    }

    public readonly loop = () => {
        Memory.time = Date.now();
    };
}
