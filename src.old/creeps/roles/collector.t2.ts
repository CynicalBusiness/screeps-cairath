import CreepRoleWorker from ".";
import _ from "lodash";
import { ICreepWithRole } from "../../types";
import { CreepRole } from "..";
import CreepRoleCollectorT1 from "./collector.t1";

export default class CreepRoleCollectorT2 extends CreepRoleCollectorT1 {
    public readonly neededParts = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
}
