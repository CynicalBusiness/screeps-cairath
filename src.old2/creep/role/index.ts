import { GameLoopConsumer } from "../../util";
import { CreepRoleType, CreepRoleParts } from "../../const";
import _ from "lodash";

/**
 * A role controller for creeps
 */
export abstract class CreepRole<
    TName extends string = string,
    TMemory = {}
> extends GameLoopConsumer {
    public static calculateMovePartsNeeded(
        role: CreepRoleType,
        tier: number = 1
    ): number {
        switch (role) {
            case CreepRoleType.HARVESTER:
                // some roles don't need effective moves
                return 1;
            default:
                return Math.ceil(
                    (CreepRoleParts[role].length *
                        Math.max(1, Math.floor(tier))) /
                        2
                );
        }
    }

    public readonly creep: ManagedCreep<{ [K in TName]: this }>;

    public constructor(name: TName, initialMemory: TMemory, creep: Creep) {
        super();
        this.creep = creep as ManagedCreep<{ [K in TName]: this }>;
    }

    public get memory(): CreepMemory<{ [K in TName]: this }> {
        return this.creep.memory;
    }
}
