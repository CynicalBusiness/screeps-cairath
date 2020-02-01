import CreepRoleWorker from "./roles";
import CreepRoleHarvestT1, {
    CreepRoleHarvestT1Name,
    ICreepRoleHarvestData
} from "./roles/harvest.t1";
import CreepRoleUpgradeT1, { CreepRoleUpgradeT1Name } from "./roles/upgrade.t1";
import { Dictionary } from "lodash";
import CreepRoleRepairT1, { CreepRoleRepairT1Name } from "./roles/repair.t1";
import CreepRoleBuildT1, {
    CreepRoleBuildT1Name,
    ICreepRoleBuildT1Data
} from "./roles/builder.t1";

export const CreepRoleWorkers: { [K in CreepRoles]: CreepRoleWorker<K> } = {
    [CreepRoleHarvestT1Name]: new CreepRoleHarvestT1(),
    [CreepRoleUpgradeT1Name]: new CreepRoleUpgradeT1(),
    [CreepRoleRepairT1Name]: new CreepRoleRepairT1(),
    [CreepRoleBuildT1Name]: new CreepRoleBuildT1()
};

export interface ICreepRoleWorkerData
    extends Record<CreepRoles, Dictionary<any>> {
    [CreepRoleHarvestT1Name]: ICreepRoleHarvestData;
    [CreepRoleUpgradeT1Name]: {};
    [CreepRoleRepairT1Name]: {};
    [CreepRoleBuildT1Name]: ICreepRoleBuildT1Data;
}

export type CreepRoles =
    | typeof CreepRoleHarvestT1Name
    | typeof CreepRoleUpgradeT1Name
    | typeof CreepRoleRepairT1Name
    | typeof CreepRoleBuildT1Name;
