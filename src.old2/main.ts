import { CynGame } from "./game";

global.GameCore = CynGame.load();
export const loop = GameCore.loop;
