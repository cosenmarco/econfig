import { Dictionary } from 'lodash';
import {all, partition} from 'lodash/fp';
import DimensionValue from './DimensionValue';

export interface ResolvedConfigValue {
    value: any;
    dynamicDimensionValues: DimensionValue[];
}

export default class ConfigValue implements ResolvedConfigValue {
    private _value: any;
    private _staticDimensionValues: DimensionValue[];
    private _dynamicDimensionValues: DimensionValue[];

    constructor(value: any, dimensionValues: DimensionValue[]) {
        this._value = value;
        // Builds two maps by partitioning according to type of dimension
        [this._dynamicDimensionValues, this._staticDimensionValues] = partition(
            (val: DimensionValue) => val.isDynamicDimension(), dimensionValues);
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

    get value() {
        return this._value;
    }

    public areAllStaticDimensionsMatching(valuesToMatch: Dictionary<string>) {
        return all((staticDimensionValue: DimensionValue) => {
            const dimensionId = staticDimensionValue.dimensionId;
            return valuesToMatch.hasOwnProperty(dimensionId) &&
                staticDimensionValue.matches(valuesToMatch[dimensionId]);
        }, this._staticDimensionValues);
    }
}
