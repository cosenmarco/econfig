import Dimension from './Dimension'

export default class DimensionValue {
    private dimension: Dimension;
    private value: any;

    constructor(dimension: Dimension, value: any) {
        this.dimension = dimension;
        this.value = value;
    }

    get dimensionId() {
        return this.dimension.id;
    }

    isDynamicDimension() {
        return this.dimension.isDynamic();
    }

    matches(value: any) {
        return this.value == value;
    }
}