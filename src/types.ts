import { Dictionary } from "lodash";
import { CreepRoleType, RoomTaskType } from "./const";
import { CreepRole } from "./creep/role";
import { CynGame } from "./game";

declare global {
    namespace NodeJS {
        interface Global {
            GameCore: CynGame;
        }
    }

    const GameCore: CynGame;

    interface Memory {
        time: number;
    }

    interface SerializedRoomPosition {
        x: number;
        y: number;
        roomName: string;
    }

    type CreepRoleMemory<TRole> = TRole extends CreepRole<string, infer M>
        ? M
        : {};

    interface ManagedCreep<TRoles extends Dictionary<CreepRole> = {}>
        extends Creep {
        /**
         * Role assigned to this creep
         */
        roles?: TRoles;
    }

    type RoomTaskWorkerType = CreepRoleType;
    type RoomTaskWorker = ManagedCreep;

    type RoomTaskOptionsEntry<TType extends RoomTaskType = RoomTaskType> = [
        TType,
        RoomTaskOptions[TType]
    ];

    interface RoomTaskOptions {
        [RoomTaskType.CARRY_RESOURCE]: {
            resource: ResourceConstant;
            pickup?: RoomPosition[];
            dropoff: RoomPosition[];
        };
        [RoomTaskType.HARVEST_SOURCE]: {
            source: RoomPosition;
            offsetX?: number;
            offsetY?: number;
        };
        [RoomTaskType.UPGRADE_CONTROLLER]: {};
    }

    type RoomTaskMemory<
        TType extends RoomTaskType = RoomTaskType
    > = RoomTaskOptions[TType] & {
        // id: Id<RoomTask>;
        workers: Id<Creep>[];
    };

    interface RoomMemory {
        tasks?: _.Dictionary<RoomTaskMemory>;
    }

    interface StructureWithStorage<
        TResource extends ResourceConstant,
        TUnlimited extends boolean = false
    > extends Structure {
        store: Store<TResource, TUnlimited>;
    }
}
