import { Dictionary } from 'lodash';
import { all, partition } from 'lodash/fp';
import { DimensionValue, ResolvedDimensionValue } from './DimensionValue';

export interface ResolvedConfigValue {
    value: any;
    dynamicDimensionValues: ResolvedDimensionValue[];
}

export class ConfigValue {
    private _value: any;
    private _staticDimensionValues: DimensionValue[];
    private _dynamicDimensionValues: DimensionValue[];

    public constructor(value: any, dimensionValues: DimensionValue[]) {
        this._value = value;
        // Builds two maps by partitioning according to type of dimension
        [this._dynamicDimensionValues, this._staticDimensionValues] = partition(
            (val: DimensionValue) => val.isDynamicDimension(), dimensionValues);
    }

    public get staticDimensionValuesLength() {
        return this._staticDimensionValues.length;
    }

    public get staticDimensionValues() {
        return this._staticDimensionValues;
    }

    public getResolvedDynamicDimensionValues() {
        return this._dynamicDimensionValues.map(dimensionValue => ({
            dimensionId: dimensionValue.dimensionId,
            value: dimensionValue.value,
        } as ResolvedDimensionValue));
    }

    public get value() {
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
