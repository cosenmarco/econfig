import Component from './Component';
import Dimension from './Dimension';

export default class CoreModel {
    private components: Map<string, Component>;
    private dimensions: Dimension[];

    constructor(components: Component[], dimensions: Dimension[]) {
        // Index the components by id so it's easier to find them.
        this.components = new Map(components.map(item => [item.id, item]));
        this.dimensions = dimensions;
    }

    /**
     * Returns the configuration keys resolved for a certain component and static dimension values.
     */
    public resolveConfiguration(componentId: string, staticDimensionValues: Map<string, any>) {
        if (!this.components.has(componentId)) {
            return undefined;
        }
        const component = this.components.get(componentId);
    }
}
