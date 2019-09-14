import fs from 'fs';
import 'reflect-metadata';
import { inspect } from 'util';
import { EigenConfig, parseValidEigenConfig } from './core/eigenconfig/EigenConfig';
import createRepository from './repository/RepositoryFactory';
import Server from './Server';
import logger from './util/logger';

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

        const repository = await createRepository(this.eigenConfig.configRepositoryType,
            this.eigenConfig.configRepositoryConfig);

        const coreModel = await repository.buildCoreModel();

        this.server = new Server(this.eigenConfig, repository, coreModel);
    }

    public stop() {
        if (this.server) {
            this.server.stop();
        }
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
