import _ from "lodash";
import { ClusterManager } from "./ClusterManager";
import { SourceController } from "./controller";

/**
 * Main game cluster
 */
export class Cluster {
    public readonly manager: ClusterManager;

    /** The name of this cluster */
    public readonly name: string;

    public readonly controllers: Readonly<Clusters.Controllers>;

    #rooms: Room[];

    public constructor(manager: ClusterManager, name: string) {
        this.manager = manager;
        this.name = name;
        const { headquarters, rooms = [] } = this.memory;

        const hq = Game.rooms[headquarters];
        if (!hq)
            throw new Error(
                "Cannot initialize Cluster with non-existant or invalid headquarters: " +
                    headquarters
            );

        this.#rooms = _.reduce(
            rooms,
            (rooms, name) => {
                const room = Game.rooms[name];
                return room ? rooms.concat(room) : [];
            },
            [hq]
        );

        this.log("Constructed {name}: [{rooms}]", {
            name,
            rooms: [headquarters, ...rooms].join(","),
        });

        this.controllers = {
            rooms: _(this.rooms)
                .keyBy("name")
                .mapValues((room) => ({
                    source: new SourceController(this, room).setup(),
                }))
                .value(),
        };
    }

    /**
     * Memory associated with this cluster
     */
    public get memory(): Clusters.Memory {
        const mem = this.manager.memory[this.name];
        if (!mem)
            throw new Error(
                "Cannot access cluster memory as no such cluster is in memory"
            );
        return mem;
    }

    /**
     * Headquarters of this cluster
     */
    public get headquarters(): Room {
        return this.#rooms[0];
    }

    /**
     * All rooms belonging to this cluster. The first room in this array is always the headquarters.
     * @see headquarters
     */
    public get rooms(): Room[] {
        return [...this.#rooms];
    }

    /**
     * Gets the controllers for a given room, or the headquarters room if not provided
     * @param roomName The name of the room
     */
    public getRoomControllers(): Clusters.RoomControllers;
    public getRoomControllers(
        roomName: string
    ): Clusters.RoomControllers | undefined;
    public getRoomControllers(
        roomName?: string
    ): Clusters.RoomControllers | undefined {
        return this.controllers.rooms[roomName ?? this.headquarters.name];
    }

    public log(message: string, formatData?: any): void {
        this.manager.log(message, formatData, this.name);
    }

    /**
     * Claims a room to this cluster
     * @param roomName The name of the room to claim
     */
    public claim(roomName: string): this {
        const room = Game.rooms[roomName];
        if (!room) throw new Error("Cannot claim a room which does not exist");
        if (this.rooms.includes(room))
            throw new Error(
                "Cannot claim room which is already claimed by this cluster"
            );
        (this.memory.rooms = this.memory.rooms ?? []).push(roomName);
        this.#rooms.push(room);
        return this;
    }
}
