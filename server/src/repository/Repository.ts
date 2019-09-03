import CoreModel from '../core/model/CoreModel';

/**
 * A Repository is a service which provides the configuration rules
 * which make up the core model.
 * A repository in the end provides an object which has a specific structure
 * and is used to build the core model.
 */
export default interface Repository {
    /**
     * Sets the configuration for the repository. This is normally called once but the
     * Repository should be able to handle multiple re-configurations during its lifetime.
     * @param configuration the configuration
     */
    setConfiguration(configuration: any): void;

    /**
     * This method builds the CoreModel starting from a representation of the model
     * in this Repository.
     */
    buildCoreModel(): Promise<CoreModel>;

    /**
     * This methods tells if the model should be re-built since the last time it was built.
     * It will return true also when the Repository is reconfigured using setConfiguration().
     */
    shouldReload(): boolean;
}
