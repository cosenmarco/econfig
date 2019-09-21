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
 *
 * The shouldReload() will try (TODO) to see if the file has been modified
 * by looking at the modified timestamp.
 *
 * The configuration will have to contain the following properties:
 * - path - A string with the path to the file which contains the model definition.
 * - format - either "json" or "yaml" to indicate how to parse the resource
 *
 * The traceability metadata has no choice to contain the entire model because
 * there is no way to trace back to the original versioned content.
 */
export class FileRepository implements Repository {
    private configuration: FileRepositoryConfig;
    private mtimeMs = 0;

    public constructor(configuration: FileRepositoryConfig) {
        this.configuration = configuration;
    }

    public async buildCoreModel() {
        const path = this.configuration.path;
        const encoding = this.configuration.encoding;

        // Gather the modified timestamp for later comparison in shouldReload()
        const stat = await fs.promises.stat(path);
        this.mtimeMs = stat.mtimeMs;

        const content = await fs.promises.readFile(path, encoding);
        if (!isString(content)) {
            throw new Error(`Expected some content while reading file '${path}'`);
        }

        logger.debug(`Loaded content from file '${path}' is:\n${content}`);

        let json = {};
        const format = this.configuration.format;
        switch (format) {
            case 'json':
                json = JSON.parse(content);
                break;
            case 'yaml':
                json = jsyaml.safeLoad(content);
                break;
            default:
                throw new Error(`Unknown format to parse CoreModel from file: ${format}`);
        }

        logger.silly(`Loaded object from file '${path}' is: ${inspect(json)}`);
        return {
            model: buildModelFromJson(json),
            meta: {
                path,
                modelJson: json,
            },
        };
    }

    public async shouldReload() {
        const { mtimeMs } = await fs.promises.stat(this.configuration.path);
        return mtimeMs > this.mtimeMs;
    }
}
