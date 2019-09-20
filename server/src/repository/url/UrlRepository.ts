import jsyaml from 'js-yaml';
import request from 'request-promise-native';
import { inspect } from 'util';
import logger from '../../util/logger';
import buildModelFromJson from '../buildModelFromJson';
import Repository from '../Repository';
import { UrlRepositoryConfig } from './UrlRepositoryConfig';

/**
 * This Repository loads a serialized model config from a URL and produces
 * a CoreModel accordingly.
 * 
 * The shouldReload() will try (TODO) to use caching headers to understand if the
 * resource has expired.
 * 
 * The configuration will have to contain the following properties:
 * - url - A string with the URL to download the model from.
 * - format - either "json" or "yaml" to indicate how to parse the resource
 *
 * The traceability metadata has no choice to contain the entire model because
 * there is no way to trace back to the original versioned content.
 */
export class UrlRepository implements Repository {
    private configuration: UrlRepositoryConfig;

    public constructor(configuration: UrlRepositoryConfig) {
        this.configuration = configuration;
    }

    public async buildCoreModel() {
        const url = this.configuration.url;
        return request.get(url).then(content => {
            logger.debug(`Loaded content from URL '${url}' is:\n${content}`);
            let json = {};
            switch (this.configuration.format) {
                case 'json':
                    json = JSON.parse(content);
                    break;
                case 'yaml':
                    json = jsyaml.safeLoad(content);
                    break;
                default:
                    throw new Error('Unknown format to parse CoreModel from URL');
            }
            logger.silly(`Loaded object from URL '${url}' is: ${inspect(json)}`);
            return {
                model: buildModelFromJson(json),
                meta: {
                    url,
                    modelJson: json,
                },
            };
        });
    }

    public shouldReload() {
        return true;
    }
}
