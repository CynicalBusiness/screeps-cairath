import CreepRoleRepairT1 from "./Repair.t1";

export default class CreepRoleRepairT2 extends CreepRoleRepairT1 {
    public readonly neededParts = [WORK, WORK, MOVE, MOVE, CARRY, CARRY];
}
