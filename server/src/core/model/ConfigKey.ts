import { filter, sortBy } from 'lodash/fp';
import ConfigValue, { ResolvedConfigValue } from './ConfigValue'

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

    public resolveUsing(staticDimensionValues: Map<string, any>): ResolvedConfigKey {
        return {
            key: this.key,
            description: this.description,
            values: filter(value =>
                value.staticDimensionValuesLength === 0 ||
                value.areAllStaticDimensionsMatching(staticDimensionValues),
            this.values),
        };
    }
}
