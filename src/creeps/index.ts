import CreepRoleWorker from "./roles";
import CreepRoleHarvestT1 from "./roles/harvest.t1";
import CreepRoleUpgradeT1 from "./roles/upgrade.t1";
import { Dictionary } from "lodash";
import CreepRoleRepairT1 from "./roles/repair.t1";
import CreepRoleBuildT1 from "./roles/builder.t1";
import CreepRoleHarvestT2 from "./roles/harvest.t2";
import CreepRoleHarvestT3 from "./roles/harvest.t3";
import CreepRoleUpgradeT2 from "./roles/upgrade.t2";

export enum CreepRole {
    Build = "build",
    Harvest = "harvest",
    Repair = "repair",
    Upgrade = "upgrade"
}

export const CreepRoleWorkers: { [K in CreepRole]: CreepRoleWorker<K>[] } = {
    [CreepRole.Build]: [new CreepRoleBuildT1()],
    [CreepRole.Harvest]: [
        new CreepRoleHarvestT1(),
        new CreepRoleHarvestT2(),
        new CreepRoleHarvestT3()
    ],
    [CreepRole.Repair]: [new CreepRoleRepairT1()],
    [CreepRole.Upgrade]: [new CreepRoleUpgradeT1(), new CreepRoleUpgradeT2()]
};

export interface ICreepRoleWorkerData
    extends Record<CreepRole, Dictionary<any>> {
    [CreepRole.Build]: {
        target?: string;
    };
    [CreepRole.Harvest]: {
        source?: string;
        needsUnloading?: boolean;
        spawnName: string;
    };
    [CreepRole.Repair]: {
        target?: Id<Structure>;
    };
    [CreepRole.Upgrade]: {
        upgrading?: boolean;
    };
}
