import { GameLoopConsumer } from "../util";
import { CynGame } from "../game";
import { RoomTaskType } from "../const";

export class RoomManager extends GameLoopConsumer {
    public readonly game: CynGame;
    public readonly room: Room;

    public readonly neededTasks: RoomTaskOptionsEntry[] = [
        [
            RoomTaskType.HARVEST_SOURCE,
            {
                source: new RoomPosition(22, 35, this.room.name),
                offsetY: 1,
            },
        ],
        [
            RoomTaskType.CARRY_RESOURCE,
            {
                resource: RESOURCE_ENERGY,
                pickup: [new RoomPosition(22, 36, this.room.name)],
                dropoff: [this.room.find(FIND_MY_SPAWNS)[0].pos],
            },
        ],
        [RoomTaskType.UPGRADE_CONTROLLER, {}],
    ];

    public constructor(game: CynGame, room: Room) {
        super();
        this.room = room;
        this.game = game.addLoopConsumer(this);
        console.log("> Room Loaded:", room.name);
    }

    public onLoop(): void {}
}
