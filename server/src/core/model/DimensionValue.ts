import { Dimension } from './Dimension';

export default class DimensionValue {
    private dimension: Dimension;
    private value: any;

    constructor(dimension: Dimension, value: any) {
        dimension.validateValue(value);
        this.dimension = dimension;
        this.value = value;
    }

    get dimensionId() {
        return this.dimension.id;
    }

    public isDynamicDimension() {
        return this.dimension.isDynamic();
    }

    public matches(incoming: any) {
        return this.dimension.matchValue(incoming, this.value);
    }
}
