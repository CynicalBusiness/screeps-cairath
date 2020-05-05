export const OWNER = "CynicalBusiness";

export enum CreepRoleType {
    COURIER = "Courier",
    HARVESTER = "Harvester",
    UPGRADER = "Upgrader",
}

export enum CacheType {
    OBJECT,
    RUNTIME,
    MEMORY,
}

export enum Priority {
    LOWEST,
    LOW,
    NORMAL,
    HIGH,
    HIGHEST,
    URGENT,
}

export enum StorageType {
    GENERAL,
    INPUT,
    OUTPUT,
}

export const CreepRoleParts: {
    [K in CreepRoleType]: BodyPartConstant[];
} = {
    [CreepRoleType.COURIER]: [CARRY, CARRY],
    [CreepRoleType.HARVESTER]: [WORK, WORK],
    [CreepRoleType.UPGRADER]: [WORK, CARRY],
};

export enum RoomTaskType {
    CARRY_RESOURCE = "CarryResource",
    HARVEST_SOURCE = "HarvestSource",
    UPGRADE_CONTROLLER = "UpgradeController",
}

export const RoomTaskWorkerTypes: {
    [K in RoomTaskType]: CreepRoleType[];
} = {
    [RoomTaskType.CARRY_RESOURCE]: [CreepRoleType.COURIER],
    [RoomTaskType.HARVEST_SOURCE]: [CreepRoleType.HARVESTER],
    [RoomTaskType.UPGRADE_CONTROLLER]: [CreepRoleType.UPGRADER],
};

export const CREEP_TICKS_TO_LIVE_MAX = 1500;
export const CREEP_TICKS_TO_LIVE_GOOD = 1400;
export const CREEP_TICKS_TO_LIVE_LOW = 400;
