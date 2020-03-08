import express from 'express';
import * as http from 'http';
import { flow, keyBy, map } from 'lodash/fp';
import { EigenConfig } from './core/eigenconfig/EigenConfig';
import { TenantInfo, TenantModel } from './TenantModel';
import logger from './util/logger';

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

        this.service.get('/config/:tenant/:component', (req, res) => {
            const component = req.params.component;
            const tenantId = req.params.tenant;
            const tenant = this.tenants[tenantId];
            if (!tenant) {
                res.status(404).send({
                    error: 'Cannot find tenant',
                }); // TODO standardize errors
                return;
            }
            const configuration = tenant.resolveConfiguration(component, req.query);
            if (configuration) {
                res.send(configuration);
            } else {
                res.status(404).end();
            }
        });

        this.service.get('/health', (req, res) => {
            res.status(200).send({
                tenants: Object.keys(this.tenants),
            });
        });

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
