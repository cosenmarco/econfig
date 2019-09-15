import { Dimension } from './Dimension';

export interface ResolvedDimensionValue {
    dimensionId: string;
    value: any;
}

export class DimensionValue {
    public readonly value: any;
    private dimension: Dimension;

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

    public matches(incoming?: string) {
        return this.dimension.matchValue(this.value, incoming);
    }
}
