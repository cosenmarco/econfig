import { Dictionary } from 'lodash';
import { filter, flow, map, sortBy } from 'lodash/fp';
import ConfigValue, { ResolvedConfigValue } from './ConfigValue';

export interface ResolvedConfigKey {
    key: string;
    description: string;
    values: ResolvedConfigValue[];
}

export default class ConfigKey {
    private _key: string;
    private description: string;
    private values: ConfigValue[];

    constructor(key: string, description: string, values: ConfigValue[]) {
        this._key = key;
        this.description = description;
        this.values = sortBy(['staticDimensionValuesLength'], values).reverse();
    }

    get key() {
        return this._key;
    }

    public resolveUsing(staticDimensionValues: Dictionary<string>): ResolvedConfigKey {
        const filteredValues = flow(
            filter((value: ConfigValue) =>
                value.staticDimensionValuesLength === 0 ||
                value.areAllStaticDimensionsMatching(staticDimensionValues)),
            map((value: ConfigValue) => ({
                value: value.value,
                dynamicDimensionValues: value.dynamicDimensionValues,
            } as ResolvedConfigValue)),
        )(this.values);
        return {
            key: this.key,
            description: this.description,
            values: filteredValues,
        };
    }
}
