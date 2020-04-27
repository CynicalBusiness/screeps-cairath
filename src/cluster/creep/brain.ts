import _ from "lodash";
import { CynCreepController } from "./controller";

export abstract class CreepBrain<
    TRole extends CynCluster.Creep.ROLE_ANY = CynCluster.Creep.ROLE_ANY
> {
    /**
     * Constructs a "generic" body, in which the provided layout, plus a single `MOVE`, is simply multiplied by the size tier.
     * @param sizeTier The size tier of the body to get
     * @param layout The layout to use
     */
    public static getGenericBody(
        sizeTier: number,
        layout: BodyPartConstant[]
    ): BodyPartConstant[] {
        const body: BodyPartConstant[] = [];
        for (let i = 0; i < sizeTier; i++) {
            body.push(...layout, MOVE);
        }
        return body;
    }

    public static createIdleTask(
        room?: Room | null
    ): CynCluster.Task.Object.Idle {
        return {
            type: "Idle",
            priority: -1,
            at: room?.findParkingFlag()?.pos,
        };
    }

    public readonly controller: CynCreepController;
    public readonly role: TRole;

    #pendingTasks: CynCluster.Creep.RoleTaskOf<TRole>[] = [];

    public constructor(controller: CynCreepController, role: TRole) {
        this.controller = controller;
        this.role = role;
    }

    /** Pending tasks this brain is capable of handling */
    public get pendingTasks(): CynCluster.Creep.RoleTaskOf<TRole>[] {
        return this.#pendingTasks;
    }

    /**
     * Makes a creep brain work, returning the a work task to do next tick, if any
     * @param creep The creep to do work with
     */
    public abstract work(
        creep: CynCluster.Creep.ClusterCreep<TRole>
    ): CynCluster.Creep.RoleTasks[TRole] | undefined;

    /**
     * Gets whether or not a given task is available to this brain
     * @param task The task to check
     */
    public abstract canTakeTask(
        task: CynCluster.Task.Object.Any
    ): task is CynCluster.Creep.RoleTaskOf<TRole>;

    /**
     * Gets body parts a creep should have for a given size
     * @param sizeTier The size tier
     */
    public abstract getBodyParts(sizeTier: number): BodyPartConstant[];

    public canCreepTakeTask(
        task: CynCluster.Creep.RoleTaskOf<TRole>,
        creep: CynCluster.Creep.ClusterCreep<TRole>
    ): boolean {
        _.noop(creep); // consume this, but it should be available for things that need it.
        return this.canTakeTask(task);
    }

    /**
     * Makes a creep brain act on a given creep, returning the task that will be done next tick
     * @param creep The creep to act on
     */
    public act(
        creep: CynCluster.Creep.ClusterCreep<TRole>
    ): CynCluster.Creep.RoleTaskOf<TRole> {
        // do tasks
        const { task } = creep;
        let newTask: CynCluster.Creep.RoleTaskOf<TRole> | undefined = undefined;
        switch (task.type) {
            case "Idle":
                if (task.at)
                    creep.moveTo(
                        new RoomPosition(
                            task.at.x,
                            task.at.y,
                            task.at.roomName
                        ),
                        {
                            range: 1,
                        }
                    );
                break;
            default:
                newTask = this.work(creep);
        }

        // TODO if creep is in need of recharge, etc. then re-assign newTask

        return (
            newTask ??
            this.nextPendingTask(creep) ??
            (task.type === "Idle"
                ? task
                : CreepBrain.createIdleTask(creep.room))
        );
    }

    /**
     * Checks if a given creep is in need of recharge
     * @param creep The creep to check
     */
    public needsRecharging(
        creep: CynCluster.Creep.ClusterCreep<TRole>
    ): boolean {
        return !creep.id; // TODO actually check
    }

    public nextPendingTask(
        creep: CynCluster.Creep.ClusterCreep<TRole>
    ): CynCluster.Creep.RoleTaskOf<TRole> | undefined {
        for (
            let i = 0,
                { length } = this.#pendingTasks,
                task = this.#pendingTasks[i];
            i < length;
            i++
        ) {
            if (this.canCreepTakeTask(task, creep)) {
                return this.#pendingTasks.splice(i, 1)[0];
            }
        }
        return;
    }

    /**
     * Updates this brain's pending tasks
     */
    public updatePendingTasks(): void {
        this.#pendingTasks = _.filter(
            this.controller.cluster.pendingTasks,
            this.canTakeTask.bind(this)
        );
    }
}
