import {all, partition} from 'lodash/fp';
import DimensionValue from './DimensionValue'

export default class ConfigValue {
    private id: string;
    private value: any;
    private _staticDimensionValues: Array<DimensionValue>;
    private _dynamicDimensionValues: Array<DimensionValue>;

    constructor(id: string, value: any, dimensionValues: Array<DimensionValue>) {
        this.id = id;
        this.value = value;
        // Builds two maps by partitioning according to type of dimension
        [this._staticDimensionValues, this._dynamicDimensionValues] = partition(
            (value: DimensionValue) => value.isDynamicDimension()
        )(dimensionValues);
    }

    get staticDimensionValuesLength() {
        return this._staticDimensionValues.length;
    }

    get staticDimensionValues() {
        return this._staticDimensionValues;
    }

    get dynamicDimensionValues() {
        return this._dynamicDimensionValues;
    }

    areAllStaticDimensionsMatching(valuesToMatch: Map<string, any>) {
        return all((staticDimensionValue: DimensionValue) => {
            const dimensionId = staticDimensionValue.dimensionId;
            return valuesToMatch.has(dimensionId) &&
                staticDimensionValue.matches(valuesToMatch.get(dimensionId))
        })(this._staticDimensionValues);
    }
}