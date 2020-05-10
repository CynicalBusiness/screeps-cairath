import _ from "lodash";
import Format from "string-format";
import { Debugger } from "../../../Debugger";
import { AbstractRoomController } from "./AbstractRoomController";

export class SourceController extends AbstractRoomController {
    private _sources: _.Dictionary<Clusters.Sources.Data> = {};

    public get sources(): [Source, Clusters.Sources.Data][] {
        return _(this._sources)
            .map((sourceData) => [
                Game.getObjectById(sourceData.sourceId),
                sourceData,
            ])
            .filter((s): s is [Source, Clusters.Sources.Data] => !!s[0])
            .value();
    }

    public init(): void {
        this._sources = _(this.room.search(FIND_SOURCES))
            .keyBy("id")
            .mapValues((source) => ({
                sourceId: source.id,
                spots: source.pos.getWalkableNeighbors(false), // TODO
            }))
            .value();

        // register debug visuals
        this.game.Debugger.register("Sources", () => [
            this.room,
            _.flatMap(this.sources, ([source, { spots }]) => [
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
