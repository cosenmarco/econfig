import { IsIn } from 'class-validator';
import { isObject } from 'util';

/**
 * For the purpose of multi-tenancy of a server cluster, each tenant has a separate
 * configuration.
 */
export class TenantConfig {
    public id: string;

    @IsIn(['url', 'file'])
    public configRepositoryType = '';
    public configRepositoryConfig = {};

    @IsIn(['file'])
    public auditBackend = '';
    public auditBackendConfig = {};

    public configApiAuthStore = '';
    public configApiAuthStoreConfig = {};

    public refreshIntervalMillis = 0;

    public constructor(yamlConfig: any, tenantId: string) {
        if (!isObject(yamlConfig)) {
            throw new Error('Expected config to be an object for tenant ' + tenantId);
        }
        this.id = tenantId;
        this.configRepositoryType = yamlConfig.configRepositoryType;
        this.configRepositoryConfig = yamlConfig.configRepositoryConfig;
        this.auditBackend = yamlConfig.auditBackend;
        this.auditBackendConfig = yamlConfig.auditBackendConfig;
        this.configApiAuthStore = yamlConfig.configApiAuthStore;
        this.configApiAuthStoreConfig = yamlConfig.configApiAuthStoreConfig;
        this.refreshIntervalMillis = yamlConfig.refreshIntervalMillis;
    }
}
