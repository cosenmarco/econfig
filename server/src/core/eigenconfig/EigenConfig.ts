import { IsIn, IsNumber, Max, validateOrReject } from 'class-validator';
import jsyaml from 'js-yaml';
import { isObject } from 'util';
import logValidationErrors from '../../util/validationErrorsLogger';

export class EigenConfig {
    @IsIn(['url', 'file'])
    public configRepositoryType = '';
    public configRepositoryConfig = {};

    @IsIn(['file'])
    public auditBackend = '';
    public auditBackendConfig = {};

    public configApiAuthStore = '';
    public configApiAuthStoreConfig = {};

    public refreshIntervalMillis = 0;

    @IsNumber()
    @Max(65535)
    public port = 8080;

    public constructor(yamlConfig: any) {
        if (isObject(yamlConfig)) {
            this.configRepositoryType = yamlConfig.configRepositoryType;
            this.configRepositoryConfig = yamlConfig.configRepositoryConfig;
            this.auditBackend = yamlConfig.auditBackend;
            this.auditBackendConfig = yamlConfig.auditBackendConfig;
            this.configApiAuthStore = yamlConfig.configApiAuthStore;
            this.configApiAuthStoreConfig = yamlConfig.configApiAuthStoreConfig;
            this.refreshIntervalMillis = yamlConfig.refreshIntervalMillis;
            this.port = yamlConfig.port;
        }
    }
}

export async function parseValidEigenConfig(configFileContent: string) {
    const configYaml = jsyaml.safeLoad(configFileContent);
    const eigenConfig = new EigenConfig(configYaml);
    await validateOrReject(eigenConfig, { forbidUnknownValues: true }).catch (errors => {
        logValidationErrors(errors, '<root>');
        return Promise.reject('Error while validating eigenconfig. Cannot continue.');
    });
    return eigenConfig;
}
