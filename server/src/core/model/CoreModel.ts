import Component from './Component';
import { Dictionary } from 'lodash';

export default class CoreModel {
    private components: Map<string, Component>;

    constructor(components: Component[]) {
        // Index the components by id so it's easier to find them.
        this.components = new Map(components.map(item => [item.id, item]));
    }

    /**
     * Returns the configuration keys resolved for a certain component and static dimension values.
     */
    public resolveConfiguration(componentId: string, staticDimensionValues: Dictionary<string>) {
        const component = this.components.get(componentId);
        if (!component) {
            return undefined;
        }
        return component.resolveUsing(staticDimensionValues);
    }
}
