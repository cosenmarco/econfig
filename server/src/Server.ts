import express from 'express';
import * as http from 'http';
import moment from 'moment';
import { inspect } from 'util';
import { AuditLog } from './audit/AuditLog';
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
    private auditLog: AuditLog;

    constructor(eigenConfig: EigenConfig, auditLog: AuditLog, repository: Repository, coreModel: CoreModel) {
        this.eigenConfig = eigenConfig;
        this.auditLog = auditLog;
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
            this.auditLog.serverReady();
        });
    }

    public async triggerConfigReload() {
        if (this.repository && this.repository.shouldReload()) {
            const startMoment = moment();
            const { model, meta } = await this.repository.buildCoreModel();
            this.coreModel = model;
            this.auditLog.logConfigModelLoaded(`Refresh load triggered at ${startMoment.toISOString()}`,
                model.hash(), meta);
            logger.silly(inspect(this.coreModel, true, 9));
        }
    }

    public stop() {
        clearInterval(this.refreshHandler);
        this.serviceHandler.close(() => {
            logger.info('Closed all connections');
            this.auditLog.serverShutdown();
        });
    }
}
