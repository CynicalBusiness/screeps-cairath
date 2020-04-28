import "lodash";
import { CynClusterManager } from "./cluster";
import { CreepBrain } from "./creep/brain";
import { TaskPriority } from "./task/delegator";

declare global {
    interface Memory {
        clusters: _.Dictionary<CynCluster.Memory.Cluster>;
    }

    namespace CynCluster {
        namespace Task {
            namespace Type {
                // non-work tasks
                type NEED_RECHARGE = "Recharge";
                type NEED_SUICIDE = "Suicide";
                type NEED_ANY = NEED_RECHARGE | NEED_SUICIDE;

                // work tasks
                type WORK_BUILD = "Build";
                type WORK_REPAIR = "Repair";
                type WORK_HARVEST_SOURCE = "HarvestSource";
                type WORK_HARVEST = WORK_HARVEST_SOURCE;
                type WORK_PICKUP_POSITION = "PickupPosition";
                type WORK_PICKUP_STORAGE = "PickupStorage";
                type WORK_PICKUP = WORK_PICKUP_POSITION | WORK_PICKUP_STORAGE;
                type WORK_DROPOFF_POSITION = "DropoffPosition";
                type WORK_DROPOFF_STORAGE = "DropoffStorage";
                type WORK_DROPOFF =
                    | WORK_DROPOFF_POSITION
                    | WORK_DROPOFF_STORAGE;
                type WORK_UPGRADE_ROOM_CONTROLLER = "UpgradeRoomController";
                type WORK_UPGRADE = WORK_UPGRADE_ROOM_CONTROLLER;
                type WORK_ANY =
                    | WORK_BUILD
                    | WORK_REPAIR
                    | WORK_HARVEST
                    | WORK_PICKUP
                    | WORK_DROPOFF
                    | WORK_UPGRADE;

                // others
                type IDLE = "Idle";
                type ANY_NON_IDLE = WORK_ANY | NEED_ANY;
                type ANY = ANY_NON_IDLE | IDLE;
            }

            namespace Object {
                interface Generic<TType extends Type.ANY> {
                    type: TType;
                    priority: TaskPriority;
                    allowMultipleWorkers?: boolean;
                }

                /** Task to go idle */
                interface Idle extends Generic<Type.IDLE> {
                    /** Where to stand idle */
                    at?: SerializedRoomPosition;
                }

                /** Recharge at a spawn */
                interface Recharge extends Generic<Type.NEED_RECHARGE> {
                    /** Spawn to recharge at */
                    at: Id<StructureSpawn>;
                }

                /** Work on a construction site */
                interface WorkBuild extends Generic<Type.WORK_BUILD> {
                    /** The site to work on building */
                    target: Id<ConstructionSite>;
                }

                /** Repair a structure */
                interface WorkRepair extends Generic<Type.WORK_REPAIR> {
                    /** The target in need of repair */
                    target: Id<Structure>;
                    /** If true, only repair the target once, then move to next task */
                    once?: boolean;
                    /** If provided, target will be repaired until `hits/maxHits` is greater */
                    threshold?: number;
                }

                /** Harvest a source */
                interface HarvestSource
                    extends Generic<Type.WORK_HARVEST_SOURCE> {
                    /** source to harvest from */
                    source: Id<Source>;
                    /** Spot to stand when harvesting the source */
                    from: SerializedRoomPosition;
                    /** String version of the harvesting spot */
                    fromStr: string;
                }

                /** Pickup from position */
                interface PickupPosition<
                    TResource extends ResourceConstant = ResourceConstant
                > extends Generic<Type.WORK_PICKUP_POSITION> {
                    /** Where to pick up from */
                    from: Id<Resource<TResource>>;
                    /** Resource to pick up */
                    resource: TResource;
                    /** Amount to pick up,  */
                    amount?: number;
                }

                /** Pickup from storage */
                interface PickupStorage<
                    TResource extends ResourceConstant = ResourceConstant
                > extends Generic<Type.WORK_PICKUP_STORAGE> {
                    /** Where to pick up from */
                    from?: Id<StructureWithStorage<TResource>>;
                    /** Resource to pick up */
                    resource: TResource;
                    /** Amount to pick up,  */
                    amount?: number;
                }

                /** Drop-off to position */
                interface DropoffPosition<
                    TResource extends ResourceConstant = ResourceConstant
                > extends Generic<Type.WORK_DROPOFF_POSITION> {
                    /** Where to pick up from */
                    to: SerializedRoomPosition;
                    /** Resource to pick up */
                    resource: TResource;
                    /** Amount to pick up,  */
                    amount?: number;
                }

                /** Drop-off to storage */
                interface DropoffStorage<
                    TResource extends ResourceConstant = ResourceConstant
                > extends Generic<Type.WORK_DROPOFF_STORAGE> {
                    /** Where to pick up from */
                    to?: Id<StructureWithStorage<TResource>>;
                    /** Resource to pick up */
                    resource: TResource;
                    /** Amount to pick up,  */
                    amount?: number;
                }

                /** Upgrade room controller */
                interface UpgradeRoomController
                    extends Generic<Type.WORK_UPGRADE_ROOM_CONTROLLER> {
                    /** Room in which controller is located */
                    room: string;
                }

                type Needs = Recharge;
                type WorkStorage =
                    | PickupPosition
                    | PickupStorage
                    | DropoffPosition
                    | DropoffStorage;
                type Work =
                    | WorkBuild
                    | WorkRepair
                    | WorkStorage
                    | HarvestSource
                    | UpgradeRoomController;

                type Any = Idle | Needs | Work;
            }
        }

        namespace Creep {
            type ClusterCreep<TRole extends ROLE_ANY = ROLE_ANY> = Creep &
                ClusterCreepExt<TRole>;

            /** Additional extension for creeps managed by cluster */
            interface ClusterCreepExt<TRole extends CynCluster.Creep.ROLE_ANY> {
                cluster: CynClusterManager;
                clusterMemory: Memory.ClusterCreepMemory;
                task: RoleTaskOf<TRole>;
                brain: CreepBrain<TRole>;
            }

            type RoleDictionary<T> = Record<ROLE_ANY, T>;

            interface RoleTasks {
                Harvester: Task.Object.HarvestSource;
                Courier:
                    | Task.Object.PickupPosition
                    | Task.Object.PickupStorage
                    | Task.Object.DropoffPosition
                    | Task.Object.DropoffStorage;
                Upgrader:
                    | Task.Object.UpgradeRoomController
                    | Task.Object.PickupStorage;
                Builder:
                    | Task.Object.WorkBuild
                    | Task.Object.WorkRepair
                    | Task.Object.PickupStorage;
            }

            type RoleTaskOf<TRole extends ROLE_ANY> =
                | RoleTasks[TRole]
                | Task.Object.Needs
                | Task.Object.Idle;

            type ROLE_HARVESTER = "Harvester";
            type ROLE_COURIER = "Courier";
            type ROLE_UPGRADER = "Upgrader";
            type ROLE_BUILDER = "Builder";
            type ROLE_ANY =
                | ROLE_HARVESTER
                | ROLE_COURIER
                | ROLE_UPGRADER
                | ROLE_BUILDER;
        }

        namespace Memory {
            /** Cluster root memory node */
            interface Cluster {
                creeps: _.Dictionary<ClusterCreep>;
                creepsSpawning: _.Dictionary<ClusterSpawningCreep>;
                sources: _.Dictionary<ClusterSource>;
            }

            /** Memory of a creep within a cluster */
            interface ClusterCreepMemory extends CreepMemory {
                /** The spawn this creep spawned from */
                spawn: Id<StructureSpawn>;
                role: Creep.ROLE_ANY;
                task: Task.Object.Any;
            }

            /** Cluster memory of each creep */
            interface ClusterCreep {
                /** ID of the creep, can be `undefined` for creeps yet to spawn */
                id?: Id<Creep>;
                memory: ClusterCreepMemory;
            }

            interface ClusterSpawningCreep<
                TRole extends Creep.ROLE_ANY = Creep.ROLE_ANY
            > {
                spawn: Id<StructureSpawn>;
                role: TRole;
            }

            /** Cluster memory each source */
            interface ClusterSource {
                id: Id<Source>;
                memory: ClusterSourceMemory;
            }

            /** Memory belonging to each source */
            interface ClusterSourceMemory {
                miners: _.Dictionary<ClusterSourceMiner>;
            }

            /** A miner on a given source */
            interface ClusterSourceMiner {
                offsetX: number;
                offsetY: number;
                miner?: Id<Creep>;
            }
        }
    }

    /** Options for creating a cluster */
    interface CynClusterOptions {
        homeRoom: string;
        rooms?: string[];
    }
}
