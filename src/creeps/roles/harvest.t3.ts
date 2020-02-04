import CreepRoleHarvestT1 from "./harvest.t1";

export default class CreepRoleHarvestT3 extends CreepRoleHarvestT1 {
    public readonly neededParts = [
        WORK,
        WORK,
        WORK,
        MOVE,
        MOVE,
        MOVE,
        CARRY,
        CARRY,
        CARRY
    ];
}
