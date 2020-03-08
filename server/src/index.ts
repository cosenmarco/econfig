import fs from 'fs';
import moment from 'moment';
import 'reflect-metadata';
import { inspect } from 'util';
import createAuditLog from './audit/AuditLogFactory';
import { EigenConfig, parseValidEigenConfig } from './core/eigenconfig/EigenConfig';
import { TenantConfig } from './core/eigenconfig/TenantConfig';
import * as pack from './package.json';
import createRepository from './repository/RepositoryFactory';
import { Server } from './Server';
import { TenantInfo } from './TenantModel';
import logger from './util/logger';
import perform from './util/perform';

/**
 * Startup code. No real unit tests practical here: Will be covered in component tests.
 */
class ServerController {
    private eigenConfig: EigenConfig;
    private server?: Server;

    constructor(eigenConfig: EigenConfig) {
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
        this.server = new Server(this.eigenConfig, tenantInfos);
    }

    public stop() {
        if (this.server) {
            this.server.stop();
        }
    }

    private async bootstrapTenant(tenantConfig: TenantConfig): Promise<TenantInfo> {
        const repository = await createRepository(
            tenantConfig.configRepositoryType,
            tenantConfig.configRepositoryConfig);

        const auditLog = await createAuditLog(tenantConfig.auditBackend,
            tenantConfig.auditBackendConfig);

        auditLog.serverStarted(pack.version, tenantConfig);

        const startMoment = moment();
        const { model, meta } = await repository.buildCoreModel();

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

// TODO: maybe add command line parameters to tell where config is
parseValidEigenConfig(fs.readFileSync('./eigenconfig.yaml', 'utf-8')).then(async result => {
    logger.info(inspect(result));

    const server = new ServerController(result);

    const signalHandler = () => {
        server.stop();
    };
    process.on('SIGINT', signalHandler);
    process.on('SIGTERM', signalHandler);

    await server.start();
}).catch(error => logger.error(error));
