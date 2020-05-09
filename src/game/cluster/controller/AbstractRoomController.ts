import { Cluster } from "../Cluster";
import { AbstractController } from "./AbstractController";

/**
 * Extension of a controller which is dedicated to a specific room
 */
export abstract class AbstractRoomController extends AbstractController {
    /** The room this controller is associated to */
    public readonly room: Room;

    public constructor(cluster: Cluster, room: Room) {
        super(cluster);
        this.room = room;
    }
}
