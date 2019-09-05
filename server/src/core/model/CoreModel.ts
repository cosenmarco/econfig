import Component from './Component';

export default class CoreModel {
    private components: Map<string, Component>;

    constructor(components: Component[]) {
        // Index the components by id so it's easier to find them.
        this.components = new Map(components.map(item => [item.id, item]));
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
