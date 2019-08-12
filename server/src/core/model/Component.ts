import ConfigKey from './ConfigKey'
export default class Component {
    private _id: string;
    private description: string;
    private configKeys: Map<string, ConfigKey>;

    constructor(id: string, description: string, configKeys: Array<ConfigKey>) {
        this._id = id;
        this.description = description;
        this.configKeys = new Map(
            configKeys.map(item => [item.key, item])
        );
    }

    get id() {
        return this._id;
    }
}