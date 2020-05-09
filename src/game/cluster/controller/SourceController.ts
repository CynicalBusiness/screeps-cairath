import _ from "lodash";
import Format from "string-format";
import { Debugger } from "../../../Debugger";
import { AbstractRoomController } from "./AbstractRoomController";

export class SourceController extends AbstractRoomController {
    #sources: _.Dictionary<Clusters.Sources.Data> = {};

    public init(): void {
        const s = this.room.search(FIND_SOURCES);
        this.#sources = _(s)
            .keyBy("id")
            .mapValues((source) => ({
                source,
                spots: source.pos.getWalkableNeighbors(false), // TODO
            }))
            .value();
        this.game.Debugger.register("Sources", () => [
            this.room,
            _.flatMap(this.#sources, ({ source, spots }) => [
                ...Debugger.createTextVisuals(
                    source.pos.x + 0.5,
                    source.pos.y,
                    Format(
                        "source {roomName}/{sourceId}\n{sourceAmount}/{sourceMax} regen in {sourceRegen}",
                        {
                            roomName: this.room.name,
                            sourceId: source.id,
                            sourceAmount: source.energy,
                            sourceMax: source.energyCapacity,
                            sourceRegen: source.ticksToRegeneration ?? 0,
                        }
                    )
                ),
                ..._.map(spots, (spot) =>
                    Debugger.createTileHighlightVisual(spot, "#dddd00")
                ),
            ]),
        ]);
    }
}
