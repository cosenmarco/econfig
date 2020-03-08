import { Dictionary } from 'lodash';
import hash from 'object-hash';
import { UnknownComponentError } from '../errors/UnknownComponentError';
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
    public resolveConfiguration(componentId: string, staticDimensionValues: Dictionary<string>) {
        const component = this.components.get(componentId);
        if (!component) {
            throw new UnknownComponentError(componentId);
        }
        return {
            dimensions: component.dimensions,
            keys: component.resolveUsing(staticDimensionValues),
        };
    }

    public hash() {
        return hash(this);
    }
}
