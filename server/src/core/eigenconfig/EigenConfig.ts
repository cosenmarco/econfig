import { IsIn, validateOrReject } from 'class-validator';
import jsyaml from 'js-yaml';
import { isObject } from 'util';

export class EigenConfig {
    @IsIn(['url'])
    public configStore?: string;

    public configStoreConfig?: any;
    public auditBackend?: string;
    public auditBackendConfig?: any;
    public configApiAuthStore?: string;
    public configApiAuthStoreConfig?: any;
    public refreshIntervalMillis?: number;

    public constructor(yamlConfig: any) {
        if (isObject(yamlConfig)) {
            this.configStore = yamlConfig.configStore;
            this.configStoreConfig = yamlConfig.configStoreConfig;
            this.auditBackend = yamlConfig.auditBackend;
            this.auditBackendConfig = yamlConfig.auditBackendConfig;
            this.configApiAuthStore = yamlConfig.configApiAuthStore;
            this.configApiAuthStoreConfig = yamlConfig.configApiAuthStoreConfig;
            this.refreshIntervalMillis = yamlConfig.refreshIntervalMillis;
        }
    }
}

export async function parseValidEigenConfig(configFileContent: string) {
    const configYaml = jsyaml.safeLoad(configFileContent);
    const eigenConfig = new EigenConfig(configYaml);
    return validateOrReject(eigenConfig, { forbidUnknownValues: true }).then(() => eigenConfig);
}
