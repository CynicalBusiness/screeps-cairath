import _ from "lodash";
import { Debugger } from "./Debugger";
import GameCore, { ResourceManager, StorageManager } from "./game";
import { ErrorMapper } from "./utils";

import "./prototype";

Object.defineProperties(global, {
    GameCore: {
        get: GameCore.get,
    },
});

export const loop: LoopFunction = (() => {
    try {
        return ErrorMapper.wrapLoop(
            GameCore.get()
                .with(Debugger)
                .with(ResourceManager)
                .with(StorageManager)
                .init()
                .loop()
        );
    } catch (err) {
        console.log(ErrorMapper.sourceMappedStackTrace(err));
        return _.noop;
    }
})();
