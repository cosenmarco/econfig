import { CoreModel } from '../core/model/CoreModel';

/**
 * A Repository is a service which provides the configuration rules
 * which make up the core model.
 * A repository in the end provides an object which has a specific structure
 * and is used to build the core model.
 */
export interface Repository {
    /**
     * This method builds the CoreModel starting from a representation of the model
     * in this Repository. It also provides the metadata required by audit log for
     * traceability purposes
     */
    buildCoreModel(): Promise<{ model: CoreModel, meta: object}>;

    /**
     * This methods tells if the model should be re-built since the last time it was built.
     */
    shouldReload(): Promise<boolean>;
}
