import { CreepRoleWorkers, CreepRole } from "./creeps";
import {
    moveToParking,
    renewIfNeeded,
    getStorageWithAvailableSpace,
    getStorageWithAvailableResource
} from "./creeps/misc";
import CreepRoleWorker from "./creeps/roles";
import { ICreepWithRole, IRoomRoleMemory } from "./types";
import _ from "lodash";
import { getHomeRoom } from "./utils";
import { RoomRole, RoomRoleDispatchers } from "./command";
import RoomDispatcher from "./command/dispatchers";

Object.defineProperties(Creep.prototype, {
    role: {
        get() {
            const { role } = this.memory;
            return role ? role.name : undefined;
        }
    },
    tier: {
        get() {
            const { role } = this.memory;
            return role ? role.tier : 0;
        }
    }
});

Creep.prototype.moveToParking = function() {
    moveToParking(this);
};

Creep.prototype.moveAndWithdraw = function(
    resource: ResourceConstant
): boolean {
    const struct = getStorageWithAvailableResource(this.room, resource);
    if (struct) {
        switch (this.withdraw(struct, RESOURCE_ENERGY)) {
            case ERR_NOT_IN_RANGE:
                this.moveTo(struct, {
                    visualizePathStyle: { stroke: "#ffffff" }
                });
                break;
        }
        return true;
    }
    return false;
};

Creep.prototype.moveAndTransfer = function(
    resource: ResourceConstant
): boolean {
    const struct = getStorageWithAvailableSpace(this.room, resource);
    if (struct) {
        switch (this.transfer(struct, RESOURCE_ENERGY)) {
            case ERR_NOT_IN_RANGE:
                this.moveTo(struct, {
                    visualizePathStyle: { stroke: "#ffffff" }
                });
                break;
        }
        return true;
    }
    return false;
};

Creep.prototype.refillIfNeeded = function(
    resource: ResourceConstant,
    onlyWhenEmpty: boolean = false
) {
    return (
        (onlyWhenEmpty
            ? this.store[resource] === 0
            : this.store.getFreeCapacity(resource) > 0) &&
        this.moveAndWithdraw(resource)
    );
};

Creep.prototype.getWorker = function(): CreepRoleWorker | undefined {
    const { role, tier } = this;
    if (role && tier && CreepRoleWorkers[role]) {
        return CreepRoleWorkers[role][tier - 1] ?? CreepRoleWorkers[role][0];
    } else return;
};

Creep.prototype.doWork = function(): boolean {
    if (this.memory.markedForRecycling) {
        const spawn =
            this.pos.findClosestByPath(FIND_MY_SPAWNS) ??
            getHomeRoom().find(FIND_MY_SPAWNS)[0];
        RESOURCES_ALL.forEach(r => this.drop(r));
        this.say("♻");
        switch (spawn.recycleCreep(this)) {
            case ERR_NOT_IN_RANGE:
                this.moveTo(spawn);
                break;
        }
        return true;
    } else {
        if (this.renewIfNeeded()) return true;
        const worker = this.getWorker();
        const { role } = this;
        if (worker && role) {
            return worker.work(this);
        }
        return false;
    }
};

Creep.prototype.renewIfNeeded = function(): boolean {
    return renewIfNeeded(this);
};

Creep.prototype.isRole = function(roleName: CreepRole): boolean {
    const { role } = this.memory;
    return role && role.name === roleName;
};

Room.prototype.isWalkable = function(pos): boolean {
    // TODO check non-walkable structures
    const structs = pos.findInRange(FIND_STRUCTURES, 0);
    const sites = [...pos.findInRange(FIND_CONSTRUCTION_SITES, 0), ...structs];

    const nonWalkableStructures = [
        STRUCTURE_SPAWN,
        STRUCTURE_EXTENSION,
        STRUCTURE_STORAGE,
        STRUCTURE_LINK,
        STRUCTURE_WALL
    ];

    const hasRoad = !!_.find(
        structs,
        st => st.structureType === STRUCTURE_ROAD
    );
    return (
        hasRoad ||
        ((this.getTerrain().get(pos.x, pos.y) & TERRAIN_MASK_WALL) === 0 &&
            !_.find(sites, s => s.structureType in nonWalkableStructures))
    );
};

Room.prototype.findCreepsOfRole = function<TRole extends CreepRole>(
    role: TRole,
    tier?: number
): ICreepWithRole<TRole>[] {
    return this.find(FIND_MY_CREEPS, {
        filter: c =>
            c.isRole(role) &&
            (tier === undefined || c.tier === tier) &&
            !c.memory.markedForRecycling
    }) as ICreepWithRole<TRole>[];
};

Room.prototype.findCreepsOfRoleWithAtLeastTier = function<
    TRole extends CreepRole
>(role: TRole, tier: number): ICreepWithRole<TRole>[] {
    return _.filter(
        this.findCreepsOfRole(role),
        c => !!c.tier && c.tier >= tier
    );
};

Room.prototype.getDispatchers = function(): RoomDispatcher[] {
    return this.getRoles().map(r => RoomRoleDispatchers[r]);
};

Room.prototype.dispatchAll = function(): void {
    for (const role of this.memory.roles ?? []) {
        RoomRoleDispatchers[role.name].dispatch(this, role.data);
    }
};

Room.prototype.addRole = function(role: RoomRole) {
    if (this.hasRole(role)) return;

    this.memory.roles = this.memory.roles ?? [];

    const dispatcher = RoomRoleDispatchers[role];
    if (dispatcher) this.memory.roles.push(dispatcher.createNewMemory());
};

Room.prototype.getRoles = function(): RoomRole[] {
    return this.memory.roles?.map(r => r.name) ?? [];
};

Room.prototype.getRole = function<TRole extends RoomRole>(role: TRole) {
    return _.find(this.memory.roles ?? [], r => r.name === role) as Optional<
        IRoomRoleMemory<TRole>
    >;
};

Room.prototype.hasRole = function(role: RoomRole): boolean {
    return !!this.getRole(role);
};

StructureSpawn.prototype.spawnCreepWithRole = function(
    role: CreepRole,
    tier: number = 1
): ScreepsReturnCode {
    const worker = CreepRoleWorkers[role][tier - 1];
    if (!worker) {
        console.log(
            `Tried spawning creep ${role}-${tier}, but no such worker was found`
        );
        return ERR_INVALID_TARGET;
    }
    return this.spawnCreep(worker.neededParts, `${role}-${tier}-${Game.time}`, {
        memory: worker.createNewMemory(this)
    });
};

StructureSpawn.prototype.getCapacityIncludingExtensions = function(
    resource: ResourceConstant
): number | null {
    let capacity = this.store.getCapacity(resource);
    if (capacity !== null) {
        for (const ex of this.room.find(FIND_MY_STRUCTURES, {
            filter: st => st instanceof StructureExtension
        }) as StructureExtension[]) {
            const exC = ex.store.getCapacity(resource);
            if (exC !== null) capacity += exC;
        }
    }

    return capacity;
};

StructureSpawn.prototype.getFreeCapacityIncludingExtensions = function(
    resource: ResourceConstant
): number {
    let capacity = this.store.getFreeCapacity(resource);

    for (const ex of this.room.find(FIND_MY_STRUCTURES, {
        filter: st => st instanceof StructureExtension
    }) as StructureExtension[]) {
        capacity += ex.store.getFreeCapacity(resource);
    }

    return capacity;
};

StructureSpawn.prototype.getUsedCapacityIncludingExtensions = function(
    resource: ResourceConstant
): number | null {
    let capacity = this.store.getUsedCapacity(resource);
    if (capacity !== null) {
        for (const ex of this.room.find(FIND_MY_STRUCTURES, {
            filter: st => st instanceof StructureExtension
        }) as StructureExtension[]) {
            const exC = ex.store.getUsedCapacity(resource);
            if (exC !== null) capacity += exC;
        }
    }

    return capacity;
};
