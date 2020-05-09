import { SourceController } from "./controller";

declare global {
    namespace Clusters {
        interface Controllers {
            rooms: _.Dictionary<RoomControllers>;
        }

        interface RoomControllers {
            source: SourceController;
        }

        interface Memory {
            headquarters: string;
            rooms?: string[];
            control: ControllerMemory;
        }

        interface ControllerMemory {
            sources: _.Dictionary<SourceControllerMemory>;
        }

        interface SourceControllerMemory {
            sources: Id<Source>[];
        }

        namespace Sources {
            interface Data {
                source: Source;
                spots: RoomPosition[];
            }
        }
    }
}
