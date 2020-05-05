import _ from "lodash";
import { CreepBrain } from "../brain";
import { CynCreepController } from "../controller";

export class HarvesterBrain extends CreepBrain<"Harvester"> {
    public constructor(controller: CynCreepController) {
        super(controller, "Harvester");
    }

    public canTakeTask(
        task: CynCluster.Task.Object.Any
    ): task is CynCluster.Creep.RoleTaskOf<"Harvester"> {
        return task.type === "HarvestSource";
    }

    public work(
        creep: CynCluster.Creep.ClusterCreep<"Harvester">
    ): CynCluster.Creep.RoleTasks["Harvester"] | undefined {
        // do work
        const { task } = creep;
        switch (task.type) {
            case "HarvestSource":
                const source = Game.getObjectById(task.source);
                const sourceMem = creep.cluster.getSourceMemory(task.source);
                if (source && sourceMem) {
                    sourceMem.miners[task.fromStr].miner = creep.id;
                    const from = new RoomPosition(
                        task.from.x,
                        task.from.y,
                        task.from.roomName
                    );

                    const amountMined = creep.getActiveBodyparts(WORK) * 2;
                    if (
                        creep.store.getFreeCapacity(RESOURCE_ENERGY) <
                        amountMined
                    ) {
                        // TODO cache container search
                        const container = _.first(
                            creep.pos.findInRange(FIND_STRUCTURES, 1, {
                                filter: (st: Structure) =>
                                    st instanceof StructureContainer &&
                                    st.storage.isMiningContainer(),
                            })
                        );
                        if (container) {
                            creep.transfer(container, RESOURCE_ENERGY);
                        } else creep.drop(RESOURCE_ENERGY);
                    } else if (creep.pos.toString() !== task.fromStr) {
                        creep.moveTo(from);
                    } else {
                        switch (creep.harvest(source)) {
                            case ERR_NOT_IN_RANGE:
                                console.warn(
                                    `Task ${
                                        task.type
                                    } has invalid harvest spot ${from.toString()} (out of range) for source ${
                                        source.id
                                    } at ${source.pos.toString()}`
                                );
                                return;
                            case ERR_NO_BODYPART:
                                console.warn(
                                    `Creep ${creep.name} tried to harvest but had no WORK part.`
                                );
                                return;
                        }
                    }
                    return task;
                }
        }

        return;
    }

    public getBodyParts(size: number): BodyPartConstant[] {
        return CreepBrain.getGenericBody(size, [WORK, WORK, CARRY]);
    }
}
