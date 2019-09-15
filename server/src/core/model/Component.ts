import { Dictionary } from 'lodash';
import ConfigKey, { ResolvedConfigKey } from './ConfigKey';
import { Dimension } from './Dimension';

export default class Component {
    private _id: string;
    private description: string;
    private configKeys: ConfigKey[];
    private _dimensions: Dimension[];

    constructor(id: string, description: string, configKeys: ConfigKey[], dimensions: Dimension[]) {
        this._id = id;
        this.description = description;
        this.configKeys = configKeys;
        this._dimensions = dimensions;
    }

    get id() {
        return this._id;
    }

    get dimensions() {
        return this._dimensions;
    }

    public resolveUsing(staticDimensionValues: Dictionary<string>): ResolvedConfigKey[] {
        return this.configKeys
            .map(configKey => configKey.resolveUsing(staticDimensionValues));
    }
}
