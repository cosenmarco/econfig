import { sortBy, find } from 'lodash/fp';
import ConfigValue from './ConfigValue'

export default class ConfigKey {
    private _key: string;
    private description: string;
    private values: ConfigValue[];

    constructor(key: string, description: string, values: ConfigValue[]) {
        this._key = key;
        this.description = description;
        this.values = sortBy(['staticDimensionValuesLength'], values);
    }

    get key() {
        return this._key;
    }

    findBestValueForStaticDimensionValues(staticDimensionValues: Map<string, string>) {
        return find(value => value.staticDimensionValuesLength == 0 ? true : value.areAllStaticDimensionsMatching(staticDimensionValues),
            this.values);
    }
}