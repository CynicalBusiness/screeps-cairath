import "lodash";

declare global {
    namespace Cluster {
        interface Memory {
            headquarters: string;
            rooms?: string[];
        }
    }
}
