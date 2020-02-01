import { CreepRoleWorkers, ICreepRoleWorkerData, CreepRoles } from "./creeps";
import {
    moveToParking,
    renewIfNeeded,
    getStorageWithAvailableSpace,
    getStorageWithAvailableResource
} from "./creeps/misc";
import CreepRoleWorker from "./creeps/roles";
import { CreepRoleOf } from "./types";

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
    const { role } = this.memory;
    if (role) {
        return CreepRoleWorkers[role.name];
    } else return;
};

Creep.prototype.doWork = function(): boolean {
    if (this.renewIfNeeded()) return true;
    const worker = this.getWorker();
    const { role } = this.memory;
    if (worker && role) {
        return worker.work(this, role.data);
    }
    return false;
};

Creep.prototype.renewIfNeeded = function(): boolean {
    return renewIfNeeded(this);
};

Room.prototype.isWalkable = function(pos): boolean {
    // TODO check structures
    return (this.getTerrain().get(pos.x, pos.y) & TERRAIN_MASK_WALL) === 0;
};

StructureSpawn.prototype.spawnCreepWithRole = function(
    role: CreepRoles
): ScreepsReturnCode {
    const worker = CreepRoleWorkers[role] as CreepRoleWorker;
    return this.spawnCreep(worker.neededParts, role + "-" + Game.time, {
        memory: worker.createNewMemory(this, role)
    });
};
