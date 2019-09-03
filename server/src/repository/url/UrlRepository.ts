import { Service } from 'typedi';
import CoreModel from '../../core/model/CoreModel';
import Repository from '../Repository';

/**
 * This Repository loads a serialized model config from a URL and produces
 * a CoreModel accordingly.
 * The shouldReload() will try to use caching headers to understand if the
 * resource has expired.
 * The configuration will have to contain the following properties:
 * - url - A string with the URL to download the model from.
 * - format - either "json" or "yaml" to indicate how to parse the resource
 */
@Service('urlRepository')
export class UrlRepository implements Repository {
    private reconfigured = false;
    private configuration: any;

    public setConfiguration(configuration: any): void {
        this.reconfigured = true;
        this.configuration = configuration;
    }

    public buildCoreModel() {
        this.reconfigured = false;
        throw new Error('Method not implemented.');
    }

    public shouldReload() {
        return this.reconfigured; // OR (TODO) Model really changed.
    }

}
