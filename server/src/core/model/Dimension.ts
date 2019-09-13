import { isNumber, isString } from 'util';

export enum DimensionType {
    string = 'string',
    percent = 'percent',
}

export class Dimension {
    private _id: string;
    private _description: string;
    private dynamic: boolean;
    private _type: DimensionType;

    constructor(id: string, description: string, dynamic: boolean, type: string) {
        this._id = id;
        this._description = description;
        this.dynamic = dynamic;
        this._type = (DimensionType as any)[type];
        if (this._type === undefined) {
            throw new Error(`Unknown dimension type ${type}`);
        }
    }

    get id() {
        return this._id;
    }

    get description() {
        return this._description;
    }

    get type() {
        return this._type;
    }

    public isDynamic() {
        return this.dynamic;
    }

    public validateValue(value: any) {
        const errorFactory = (expected: string) => new Error(
            `Expected ${expected} for Dimension ${this.id} of type ${this.type}`)

        switch (this.type) {
            case DimensionType.percent:
                if (!isNumber(value) || value < 0 || value > 1) {
                    throw errorFactory('a number between 0 and 1');
                }
                break;
            case DimensionType.string:
                if (!isString(value)) {
                    throw errorFactory('a string');
                }
                break;
        }
    }

    /**
     * This method helps matching a dimension value in the model (known)
     * against a value incoming from the outside while resolving the configuration.
     * @param incoming The value coming from outside during a matching operation
     * @param known The known DimensionValue
     */
    public matchValue(incoming: any, known: any) {
        switch (this.type) {
            case DimensionType.percent:
                return isNumber(incoming) && Math.random() <= known;
            case DimensionType.string:
                return isString(incoming) && known === incoming;
        }
    }
}
