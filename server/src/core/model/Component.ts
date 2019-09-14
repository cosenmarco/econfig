import { Dictionary } from 'lodash';
import ConfigKey, { ResolvedConfigKey } from './ConfigKey';

export default class Component {
    private _id: string;
    private description: string;
    private configKeys: ConfigKey[];

    constructor(id: string, description: string, configKeys: ConfigKey[]) {
        this._id = id;
        this.description = description;
        this.configKeys = configKeys;
    }

    get id() {
        return this._id;
    }

    public resolveUsing(staticDimensionValues: Dictionary<string>): ResolvedConfigKey[] {
        return this.configKeys
            .map(configKey => configKey.resolveUsing(staticDimensionValues));
    }
}
