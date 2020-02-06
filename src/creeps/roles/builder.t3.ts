import CreepRoleBuildT1 from "./builder.t1";

export default class CreepRoleBuildT3 extends CreepRoleBuildT1 {
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
