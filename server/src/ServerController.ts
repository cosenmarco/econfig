import moment from 'moment';
import 'reflect-metadata';
import { createAuditLog } from './audit/AuditLogFactory';
import { EigenConfig } from './core/eigenconfig/EigenConfig';
import { TenantConfig } from './core/eigenconfig/TenantConfig';
import { TenantInfo, TenantModel } from './core/model/TenantModel';
import { Server } from './core/server/Server';
import * as pack from './package.json';
import { createRepository } from './repository/RepositoryFactory';
import { logger } from './util/logger';
import { perform } from './util/perform';

/**
 * Startup code. No real unit tests practical here: Will be covered in component tests.
 */
export class ServerController {
    private eigenConfig: EigenConfig;
    private server?: Server;

    public constructor(eigenConfig: EigenConfig) {
        this.eigenConfig = eigenConfig;
    }

    public async start() {
        logger.info('Starting server');

        const bootstrapResults = await perform(this.eigenConfig.tenants,
            tenant => this.bootstrapTenant(tenant.tenantConfig)
                .catch(error => Promise.reject(
                    `Cannot bootstrap tenant ${tenant.tenantConfig.id}: ${error}`)));

        bootstrapResults[1].forEach(result => logger.error(result.reason));

        const tenantInfos = bootstrapResults[0].map(result => result.value);
        this.server = new Server(this.eigenConfig, tenantInfos.map(info => new TenantModel(info)));
    }

    public stop() {
        if (this.server) {
            this.server.stop();
        }
    }

    private async bootstrapTenant(tenantConfig: TenantConfig): Promise<TenantInfo> {
        const repository = await createRepository(
            tenantConfig.configRepositoryType,
            tenantConfig.configRepositoryConfig,
            this.eigenConfig.eigenConfigDir,
        ).catch(error => Promise.reject(
            `Unable to create config repository of type ${tenantConfig.configRepositoryType} ` +
            `with config ${tenantConfig.configRepositoryConfig}: ${error}`));

        const auditLog = await createAuditLog(
            tenantConfig.auditBackend,
            tenantConfig.auditBackendConfig,
        ).catch(error => Promise.reject(
            `Unable to create audit backend type ${tenantConfig.auditBackend} ` +
            `with config ${tenantConfig.auditBackendConfig}: ${error}`));

        auditLog.serverStarted(pack.version, tenantConfig);

        const startMoment = moment();
        const { model, meta } = await repository.buildCoreModel()
            .catch(error => Promise.reject(
                `Unable to build core model: ${error}`));

        auditLog.logConfigModelLoaded(`Initial load triggered at ${startMoment.toISOString()}`,
            model.hash(), meta);

        return {
            model,
            repository,
            auditLog,
            tenantConfig,
        } as TenantInfo;
    }
}
