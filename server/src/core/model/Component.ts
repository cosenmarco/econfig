import { Dictionary } from 'lodash';
import { ConfigKey,  ResolvedConfigKey } from './ConfigKey';
import { Dimension } from './Dimension';

export class Component {
    private _id: string;
    private description: string;
    private configKeys: ConfigKey[];
    private _dimensions: Dimension[];

    public constructor(id: string, description: string, configKeys: ConfigKey[], dimensions: Dimension[]) {
        this._id = id;
        this.description = description;
        this.configKeys = configKeys;
        this._dimensions = dimensions;
    }

    public get id() {
        return this._id;
    }

    public get dimensions() {
        return this._dimensions;
    }

    public resolveUsing(staticDimensionValues: Dictionary<string>): ResolvedConfigKey[] {
        return this.configKeys
            .map(configKey => configKey.resolveUsing(staticDimensionValues));
    }
}
