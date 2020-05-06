import _ from "lodash";
import { Debugger } from "./Debugger";
import GameCore from "./game";
import { ErrorMapper } from "./utils";

Object.defineProperties(global, {
    GameCore: {
        get: GameCore.get,
    },
});

export const loop: LoopFunction = (() => {
    try {
        return ErrorMapper.wrapLoop(GameCore.get().with(Debugger).loop());
    } catch (err) {
        console.log(ErrorMapper.sourceMappedStackTrace(err));
        return _.noop;
    }
})();
