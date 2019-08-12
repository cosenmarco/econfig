export default class Dimension {
    private _id: string;
    private description: string;
    private dynamic: boolean;

    constructor(id: string, description: string, dynamic: boolean) {
        this._id = id;
        this.description = description;
        this.dynamic = dynamic;
    }

    get id() {
        return this._id;
    }

    isDynamic() {
        return this.dynamic;
    }
}