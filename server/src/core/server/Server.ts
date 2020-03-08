import express from 'express';
import * as http from 'http';
import { flow, keyBy, map } from 'lodash/fp';
import logger from '../../util/logger';
import { EigenConfig } from '../eigenconfig/EigenConfig';
import { InvalidTenantIdError } from '../errors/InvalidTenantIdError';
import { UnknownTenantError } from '../errors/UnknownTenantError';
import { TenantInfo, TenantModel } from '../model/TenantModel';
import errorHandlingMiddleware from './errorHandlingMiddleware';
import { InvalidComponentIdError } from '../errors/InvalidComponentIdError';

const MAX_ID_LEN = 150;

export class Server {
    private eigenConfig: EigenConfig;
    private service: express.Express;
    private serviceHandler: http.Server;
    private tenants: { [id: string ]: TenantModel};

    constructor(eigenConfig: EigenConfig, tenantInfos: TenantInfo[]) {
        this.eigenConfig = eigenConfig;
        this.tenants = flow(
            map((info: TenantInfo) => new TenantModel(info)),
            keyBy(model => model.id),
        )(tenantInfos);
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

        this.service.use(errorHandlingMiddleware);

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
