import ajv from 'ajv';
import CoreModel from '../core/model/CoreModel.js';
import * as schema from './modelSchema-00.01.json';

const schemaValidator = new ajv();

export default function buildModelFromJson(json: object) {
    const valid = schemaValidator.validate(schema, json);
    if (!valid) {
        throw new Error('Cannot parse the configuration model: ' +
            schemaValidator.errorsText());
    }
    return new CoreModel([]);
}
