import _ from "lodash";

declare global {
    interface StructureContainer {
        _isMiningContainer?: boolean;

        /** Whether or not this container is a mining container (and not general storage) */
        isMiningContainer: boolean;
    }
}

Object.defineProperties(StructureContainer.prototype, {
    isMiningContainer: {
        get(this: StructureContainer): boolean {
            if (!this._isMiningContainer) {
                const source = _.find(this.room.find(FIND_SOURCES), (source) =>
                    this.pos.inRangeTo(source, 1)
                );
                this._isMiningContainer = !!source;
            }
            return this._isMiningContainer;
        },
    },
});
