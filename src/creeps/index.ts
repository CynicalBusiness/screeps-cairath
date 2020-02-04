import CreepRoleWorker from "./roles";
import CreepRoleHarvestT1, { CreepRoleHarvestName } from "./roles/harvest.t1";
import CreepRoleUpgradeT1, { CreepRoleUpgradeT1Name } from "./roles/upgrade.t1";
import { Dictionary } from "lodash";
import CreepRoleRepairT1, { CreepRoleRepairT1Name } from "./roles/repair.t1";
import CreepRoleBuildT1, {
    CreepRoleBuildT1Name,
    ICreepRoleBuildData
} from "./roles/builder.t1";
import CreepRoleHarvestT2 from "./roles/harvest.t2";

export const CreepRoleWorkers: { [K in CreepRoles]: CreepRoleWorker<K>[] } = {
    [CreepRoleHarvestName]: [
        new CreepRoleHarvestT1(),
        new CreepRoleHarvestT2()
    ],
    [CreepRoleUpgradeT1Name]: [new CreepRoleUpgradeT1()],
    [CreepRoleRepairT1Name]: [new CreepRoleRepairT1()],
    [CreepRoleBuildT1Name]: [new CreepRoleBuildT1()]
};

export interface ICreepRoleWorkerData
    extends Record<CreepRoles, Dictionary<any>> {
    [CreepRoleHarvestName]: {
        source?: string;
        needsUnloading?: boolean;
        spawnName: string;
    };
    [CreepRoleUpgradeT1Name]: {};
    [CreepRoleRepairT1Name]: {
        target?: Id<Structure>;
    };
    [CreepRoleBuildT1Name]: ICreepRoleBuildData;
}

export type CreepRoles =
    | typeof CreepRoleHarvestName
    | typeof CreepRoleUpgradeT1Name
    | typeof CreepRoleRepairT1Name
    | typeof CreepRoleBuildT1Name;
