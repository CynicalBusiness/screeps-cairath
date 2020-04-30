import "./types";
import _ from "lodash";
import { CynGame } from "../game";
import { GameLoopConsumer } from "../util/loop";
import { CynCreepController } from "./creep/controller";
import { TaskDelegator } from "./task/delegator";
import { ConstructionTaskDelegator } from "./task/delegators/build";
import { CarryTaskDelegator } from "./task/delegators/carry";
import { SourceHarvestTaskDelegator } from "./task/delegators/harvest";
import { RoomUpgradeTaskDelegator } from "./task/delegators/roomUpgrade";

export const CLUSTER_NAME_PREFIX = "Cluster";

export type RoomFindCache<TFind extends FindConstant> = {
    [K in TFind]: FindTypes[K][] | undefined;
};

/**
 * Clusters represent control of a group of creeps/structures in a few related rooms
 */
export class CynClusterManager extends GameLoopConsumer {
    public static create(
        ...args: ConstructorParameters<typeof CynClusterManager>
    ): CynClusterManager {
        Memory.clusters = Memory.clusters ?? {};
        return new CynClusterManager(...args);
    }

    /**
     * Returns whether or not a given creep is managed by a cluster
     * @param creep The creep to check
     */
    public static isClusterManaged(
        creep: Creep
    ): creep is CynCluster.Creep.ClusterCreep {
        return creep.cluster instanceof CynClusterManager;
    }

    public readonly game: CynGame;
    public readonly name: string;
    public readonly options: Readonly<CynClusterOptions>;

    public readonly creepController: CynCreepController;
    public readonly taskDelegators: TaskDelegator[];
    public pendingTasks?: CynCluster.Task.Object.Any[];

    #cache: Partial<{
        sources: Source[];
        sourceWorkSpots: [RoomPosition, Source][];
        roomNames: string[];
        rooms: Room[];
        finds: _.Dictionary<RoomFindCache<FindConstant>>;
    }> = {};

    public constructor(
        game: CynGame,
        name: string,
        options: CynClusterOptions
    ) {
        super();
        this.game = game;
        this.name = name;
        this.options = options;
        this.game.addLoopConsumer(this);

        this.creepController = new CynCreepController(this);
        this.taskDelegators = [
            new SourceHarvestTaskDelegator(this),
            new CarryTaskDelegator(this),
            new RoomUpgradeTaskDelegator(this),
            new ConstructionTaskDelegator(this),
        ];
    }

    /**
     * Memory object belonging to this cluster
     */
    public get memory(): CynCluster.Memory.Cluster {
        return (Memory.clusters[this.name] = Memory.clusters[this.name] ?? {
            creeps: {},
            creepsSpawning: {},
            sources: {},
            storageReservations: {},
        });
    }

    /**
     * Array of room names managed by this cluster
     */
    public get roomNames(): string[] {
        if (!this.#cache.roomNames)
            this.#cache.roomNames = [
                this.options.homeRoom,
                ...(this.options.rooms ?? []),
            ];
        return this.#cache.roomNames;
    }

    /**
     * An array of rooms managed by this cluster
     */
    public get rooms(): Room[] {
        if (!this.#cache.rooms)
            this.#cache.rooms = _.chain(this.roomNames)
                .map((name) => Game.rooms[name])
                .filter((room) => !!room)
                .value();
        return this.#cache.rooms;
    }

    /**
     * An array of all spawns available to this cluster
     */
    public get spawns(): StructureSpawn[] {
        return _.flatMap(this.rooms, (room) => room.find(FIND_MY_SPAWNS));
    }

    /**
     * Finds a given find constant in all rooms in this cluster, caching it, and returning it as a dictionary of the
     * room in which the objects were found
     * @param find The find constant to search for
     */
    public find<TFind extends FindConstant>(
        find: TFind
    ): _.Dictionary<FindTypes[TFind][]> {
        return _.chain(this.roomNames)
            .map((name): [string, FindTypes[TFind][]] => [
                name,
                this.findIn(name, find, true),
            ])
            .keyBy(([name]) => name)
            .mapValues(([, finds]) => finds)
            .value();
    }

    /**
     * Finds a given find constant in all rooms in this cluster, caching it, and returning the array of all objects
     * founds without the room name
     * @param find The find constant to search for
     */
    public findAll<TFind extends FindConstant>(
        find: TFind
    ): FindTypes[TFind][] {
        return _.flatMap(this.roomNames, (name) =>
            this.findIn(name, find, true)
        );
    }

    /**
     * Runs a {@link Room#find} on a given room, and caches it. If the room does not belong to this cluster, an empty
     * array is always returned
     * @param roomName The room name
     * @param find The find constant to search for
     */
    public findIn<TFind extends FindConstant>(
        roomName: string,
        find: TFind,
        _skipRoomCheck?: boolean
    ): FindTypes[TFind][] {
        if (!_skipRoomCheck && !this.roomNames.includes(roomName)) return [];

        this.#cache.finds = this.#cache.finds ?? {};
        const roomFinds: RoomFindCache<TFind> = (this.#cache.finds[roomName] =
            this.#cache.finds[roomName] ?? {});
        return (roomFinds[find] =
            roomFinds[find] ?? Game.rooms[roomName].find(find));
    }

    /**
     * Gets the first spawn able to spawn a creep of the given parameters
     * @param role The role to spawn
     * @param size The size of the role
     * @param options The options for spawning
     */
    public getSpawnCapableOfSpawning(
        role: CynCluster.Creep.ROLE_ANY,
        size: number,
        options?: SpawnOptions
    ): StructureSpawn | undefined {
        return _.chain(this.spawns)
            .filter((spawn) => spawn.isActive() && !spawn.spawning)
            .filter(
                (spawn) =>
                    spawn.spawnClusterCreep(role, size, {
                        ...options,
                        dryRun: true,
                    }) === 0
            )
            .first()
            .value();
    }

    /**
     * Creeps associated with this cluster
     */
    public get creeps(): CynCluster.Creep.ClusterCreep[] {
        return this.getCreeps();
    }

    public getCreeps(
        includeCurrentlySpawning = false
    ): CynCluster.Creep.ClusterCreep[] {
        return _.filter(
            _.values(Game.creeps),
            (creep): creep is CynCluster.Creep.ClusterCreep =>
                creep.isManaged() &&
                creep.cluster === this &&
                (includeCurrentlySpawning || !creep.spawning)
        );
    }

    /**
     * Gets all creeps managed by this cluster of a given role
     * @param role
     */
    public getCreepsOfRole<TRole extends CynCluster.Creep.ROLE_ANY>(
        role: TRole,
        includeCurrentlySpawning = false
    ): CynCluster.Creep.ClusterCreep<TRole>[] {
        return _.filter(
            this.getCreeps(includeCurrentlySpawning),
            (creep): creep is CynCluster.Creep.ClusterCreep<TRole> =>
                creep.clusterMemory.role === role
        );
    }

    /**
     * Gets the number of creeps in a given role
     * @param role The role to search
     * @param includeCurrentlySpawning Whether or not to include creeps still trying to spawn
     */
    public getNumCreepsOfRole(
        role: CynCluster.Creep.ROLE_ANY,
        includeCurrentlySpawning = false
    ): number {
        return this.getCreepsOfRole(role, includeCurrentlySpawning).length;
    }

    /**
     * Gets the memory for a given creep from this cluster
     * @param creep The creep to get memory for
     */
    public getCreepMemory(name: string): CynCluster.Memory.ClusterCreepMemory {
        return (this.memory.creeps[name] = this.memory.creeps[name] ?? {
            memory: {},
        }).memory;
    }

    /**
     * Gets the memory associated with a given source
     * @param id The ID of the source
     */
    public getSourceMemory(
        id: Id<Source>
    ): CynCluster.Memory.ClusterSourceMemory {
        const source = Game.getObjectById(id);
        return source && source.cluster === this
            ? (this.memory.sources[id] = this.memory.sources[id] ?? {
                  id,
                  memory: { miners: {} },
              }).memory
            : { miners: {} };
    }

    /**
     * Gets an array of all sources managed by this cluster
     * @param room Optionally, a room to filter by
     */
    public getSources(room?: string): Source[] {
        if (!this.#cache.sources) {
            this.#cache.sources = _.chain(this.rooms)
                .map((room) => room.find(FIND_SOURCES))
                .flatten()
                .value();
        }

        return room
            ? _.filter(
                  this.#cache.sources,
                  (source) => source.room.name === room
              )
            : [...this.#cache.sources];
    }

    /**
     * Cleans up memory, called each tick
     */
    public cleanupMemory(): void {
        // clean up memory of creeps that are dead
        for (const creepName of Object.keys(this.memory.creeps)) {
            if (!Game.creeps[creepName]) delete this.memory.creeps[creepName];
        }
    }

    public onLoop(): void {
        // temp stuff
        _.chain(this.findAll(FIND_MY_STRUCTURES))
            .filter(
                (s): s is StructureTower => s.structureType === STRUCTURE_TOWER
            )
            .each((tower) => this.tempOperateTower(tower))
            .value();

        // spawn creeps to correct amount
        const neededPerRole = this.creepController.getNeededCreeps();
        for (const role of _.keys(
            neededPerRole
        ) as CynCluster.Creep.ROLE_ANY[]) {
            const needed = neededPerRole[role] ?? 0;
            let has = this.getNumCreepsOfRole(role, true);

            const size = role === "Courier" || role === "Builder" ? 2 : 1; // TODO size tier
            let spawn: StructureSpawn | undefined;
            while (
                needed > has++ &&
                (spawn = this.getSpawnCapableOfSpawning(role, size))
            )
                spawn.spawnClusterCreep(role, size);
        }

        // update tasks
        this.pendingTasks = _.chain(this.taskDelegators)
            .flatMap((de) => de.findWork())
            .sortBy("priority")
            .reverse()
            .value();
        this.memory.pendingTasks = this.pendingTasks;
        this.creepController.updatePendingTasks();

        // make creeps do their things
        this.creepController.actAll();

        // finally, clean up
        this.cleanupMemory();
    }

    /** Temporary tower control just so we don't die */
    private tempOperateTower(tower: StructureTower): void {
        const { room } = tower;

        const hostile =
            tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS) ??
            tower.pos.findClosestByRange(FIND_HOSTILE_POWER_CREEPS);
        if (hostile) {
            tower.attack(hostile);
            return;
        }

        const missingHitsFilter = {
            filter: (v: AnyCreep | AnyStructure) => v.hits < v.hitsMax,
        };
        const wounded =
            tower.pos.findClosestByRange(FIND_MY_CREEPS, missingHitsFilter) ??
            tower.pos.findClosestByRange(
                FIND_MY_POWER_CREEPS,
                missingHitsFilter
            );
        if (wounded) {
            tower.heal(wounded);
            return;
        }

        const roadNeedingRepair = _.sortBy(
            room.find(FIND_STRUCTURES, {
                filter: (st) => st.hits < st.hitsMax,
            }) as StructureRoad[],
            (st) => st.hits
        )[0];
        if (roadNeedingRepair) {
            tower.repair(roadNeedingRepair);
            return;
        }
    }
}
