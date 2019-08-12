import Component from './Component'
import Dimension from './Dimension'

class CoreModel {
    components: Map<string, Component>;
    dimensions: Array<Dimension>;

    constructor(components: Array<Component>, dimensions: Array<Dimension>) {
        // Index the components by id so it's easier to find them.
        this.components = new Map(
            components.map(item => [item.id, item])
        );
        this.dimensions = dimensions;
    }

    /**
     * Returns the configuration keys resolved for a certain component and dimension values.
     */ 
    public resolveConfiguration(componentId: string, staticDimensionValues: Map<string, string>) {
        if (!this.components.has(componentId)) {
            return null;
        }
        const component = this.components.get(componentId);
    }
}