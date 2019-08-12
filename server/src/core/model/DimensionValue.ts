import Dimension from './Dimension'

export default class DimensionValue {
    private dimension: Dimension;
    private value: string;

    constructor(dimension: Dimension, value: string) {
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