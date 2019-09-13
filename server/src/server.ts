import fs from 'fs';
import 'reflect-metadata';
import { inspect } from 'util';
import { EigenConfig, parseValidEigenConfig } from './core/eigenconfig/EigenConfig';
import CoreModel from './core/model/CoreModel';
import logger from './logger';
import Repository from './repository/Repository';
import createRepository from './repository/RepositoryFactory';

/**
 * Startup code. No real unit tests practical here: Will be covered in component tests.
 */
class Server {
    private eigenConfig: EigenConfig;
    private refreshHandler?: NodeJS.Timeout;
    private coreModel?: CoreModel;
    private repository?: Repository;

    constructor(eigenConfig: EigenConfig) {
        this.eigenConfig = eigenConfig;
    }

    public async start() {
        logger.info('Starting server');

        this.repository = await createRepository(this.eigenConfig.configRepositoryType,
            this.eigenConfig.configRepositoryConfig);

        // If we can't load even the first time, better fail fast.
        await this.triggerConfigReload();

        this.refreshHandler = setInterval(() => this.triggerConfigReload()
            .catch(error => logger.error(error)), this.eigenConfig.refreshIntervalMillis);
    }

    public async triggerConfigReload() {
        if (this.repository && this.repository.shouldReload()) {
            this.coreModel = await this.repository.buildCoreModel();
            logger.silly(inspect(this.coreModel, true, 9));
        }
    }

    public stop() {
        if (this.refreshHandler) {
            clearInterval(this.refreshHandler);
        }
    }
}

// TODO: maybe add command line parameters to tell where config is
parseValidEigenConfig(fs.readFileSync('./eigenconfig.yaml', 'utf-8')).then(async result => {
    logger.info(inspect(result));

    const server = new Server(result);

    const signalHandler = () => {
        server.stop();
    };
    process.on('SIGINT', signalHandler);
    process.on('SIGTERM', signalHandler);

    await server.start();
}).catch(error => logger.error(error));
