import express from 'express';
import * as http from 'http';
import { keyBy } from 'lodash/fp';
import { logger } from '../../util/logger';
import { EigenConfig } from '../eigenconfig/EigenConfig';
import { InvalidComponentIdError } from '../errors/InvalidComponentIdError';
import { InvalidTenantIdError } from '../errors/InvalidTenantIdError';
import { UnknownTenantError } from '../errors/UnknownTenantError';
import { TenantModel } from '../model/TenantModel';
import { errorMiddleware } from './errorHandlingMiddleware';

const MAX_ID_LEN = 150;

export class Server {
    private eigenConfig: EigenConfig;
    private service: express.Express;
    private serviceHandler: http.Server;
    private tenants: { [id: string ]: TenantModel};

    public constructor(eigenConfig: EigenConfig, tenantModels: TenantModel[]) {
        this.eigenConfig = eigenConfig;
        this.tenants = keyBy((model: TenantModel) => model.id)(tenantModels);
        this.service = express();

        this.service.set('etag', false);
        this.service.set('x-powered-by', eigenConfig.xPoweredByHeaderInResponses);

        this.service.get('/config/:tenant/:component', (req, res) => {
            const componentId = req.params.component;
            const tenantId = req.params.tenant;

            if (tenantId.length > MAX_ID_LEN) {
                throw new InvalidTenantIdError(tenantId.substring(0, MAX_ID_LEN) + '...');
            }

            if (componentId.length > MAX_ID_LEN) {
                throw new InvalidComponentIdError(componentId.substring(0, MAX_ID_LEN) + '...');
            }

            const tenant = this.tenants[tenantId];
            if (!tenant) {
                throw new UnknownTenantError(tenantId);
            }

            const configuration = tenant.resolveConfiguration(componentId, req.query);
            res.send(configuration);
        });

        this.service.get('/health', (req, res) => {
            res.status(200).send({
                tenants: Object.keys(this.tenants),
            });
        });

        this.service.use(errorMiddleware);

        const port = this.eigenConfig.port;
        this.serviceHandler = this.service.listen(port, () => {
            logger.info(`Service listening on port ${port}`);
            Object.values(this.tenants).forEach(tenant => tenant.serverReady());
        });
    }

    public stop() {
        Object.values(this.tenants).forEach(tenant => tenant.initiateShutdown());
        this.serviceHandler.close(() => {
            logger.info('Closed all connections');
            Object.values(this.tenants).forEach(tenant => tenant.serverShutdown());
        });
    }
}
