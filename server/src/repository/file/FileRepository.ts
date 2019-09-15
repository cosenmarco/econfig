import fs from 'fs';
import jsyaml from 'js-yaml';
import { inspect, isString } from 'util';
import logger from '../../util/logger';
import buildModelFromJson from '../buildModelFromJson';
import Repository from '../Repository';
import { FileRepositoryConfig } from './FileRepositoryConfig';

/**
 * This Repository loads a serialized model config from a file and produces
 * a CoreModel accordingly.
 * The shouldReload() will try (TODO) to see if the file has been modified
 * by looking at the modified timestamp.
 * The configuration will have to contain the following properties:
 * - path - A string with the path to the file which contains the model definition.
 * - format - either "json" or "yaml" to indicate how to parse the resource
 */
export class FileRepository implements Repository {
    private configuration: FileRepositoryConfig;

    public constructor(configuration: FileRepositoryConfig) {
        this.configuration = configuration;
    }

    public async buildCoreModel() {
        const path = this.configuration.path;
        const encoding = this.configuration.encoding;
        return fs.promises.readFile(path, encoding).then(content => {
            if (!isString(content)) {
                throw new Error('Ouch');
            }
            logger.debug(`Loaded content from file '${path}' is:\n${content}`);
            let json = {};
            switch (this.configuration.format) {
                case 'json':
                    json = JSON.parse(content);
                    break;
                case 'yaml':
                    json = jsyaml.safeLoad(content);
                    break;
                default:
                    throw new Error('Unknown format to parse CoreModel from file');
            }
            logger.silly(`Loaded object from file '${path}' is: ${inspect(json)}`);
            return buildModelFromJson(json);
        });
    }

    public shouldReload() {
        return true;
    }
}