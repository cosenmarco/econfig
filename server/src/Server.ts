import express from 'express';
import * as http from 'http';
import { inspect } from 'util';
import { EigenConfig } from './core/eigenconfig/EigenConfig';
import CoreModel from './core/model/CoreModel';
import Repository from './repository/Repository';
import logger from './util/logger';

export default class Server {
    private eigenConfig: EigenConfig;
    private refreshHandler: NodeJS.Timeout;
    private coreModel: CoreModel;
    private repository: Repository;
    private service: express.Express;
    private serviceHandler: http.Server;

    constructor(eigenConfig: EigenConfig, repository: Repository, coreModel: CoreModel) {
        this.eigenConfig = eigenConfig;
        this.repository = repository;
        this.coreModel = coreModel;
        this.refreshHandler = setInterval(() => this.triggerConfigReload()
            .catch(error => logger.error(error)), this.eigenConfig.refreshIntervalMillis);
        this.service = express();

        this.service.get('/config/:component', (req, res) => {
            const component = req.params.component;
            const configuration = this.coreModel.resolveConfiguration(component, req.query);
            if (configuration) {
                res.send(configuration);
            } else {
                res.status(404).end();
            }
        });

        this.service.get('/health', (req, res) => {
            res.status(204);
        });

        const port = this.eigenConfig.port;
        this.serviceHandler = this.service.listen(port, () => {
            logger.info(`Service listening on port ${port}`);
        });
    }

    public async triggerConfigReload() {
        if (this.repository && this.repository.shouldReload()) {
            this.coreModel = await this.repository.buildCoreModel();
            logger.silly(inspect(this.coreModel, true, 9));
        }
    }

    public stop() {
        clearInterval(this.refreshHandler);
        this.serviceHandler.close(() => {
            logger.info('Closed all connections');
        });
    }
}
