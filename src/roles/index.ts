import builder from "./builder";
import harvester from "./harvester";
import repairer from "./repairer";
import upgrader from "./upgrader";

export type RoleName = "builder" | "harvester" | "repairer" | "upgrader";

export type Roles = {
    [K in RoleName]: ((creep: Creep) => void) | undefined;
};

const roles: Roles = {
    builder,
    harvester,
    repairer,
    upgrader
};

export default roles;
