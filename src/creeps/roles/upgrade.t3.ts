import CreepRoleUpgradeT1 from "./upgrade.t1";

export default class CreepRoleUpgradeT3 extends CreepRoleUpgradeT1 {
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
