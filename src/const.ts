export const OWNER = "CynicalBusiness";

export enum CreepRoleType {
    COURIER = "Courier",
    HARVESTER = "Harvester",
    UPGRADER = "Upgrader",
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
