import _ from "lodash";
import { Debugger } from "./Debugger";
import GameCore, { ClusterManager, StorageManager } from "./game";
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
                .with(StorageManager)
                .with(ClusterManager)
                .init()
                .loop()
        );
    } catch (err) {
        console.log(ErrorMapper.sourceMappedStackTrace(err));
        return _.noop;
    }
})();
