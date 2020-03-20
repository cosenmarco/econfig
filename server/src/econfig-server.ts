import fs from 'fs';
import { dirname } from 'path';
import 'reflect-metadata';
import { inspect, isString } from 'util';
import yargs from 'yargs';
import { parseValidEigenConfig } from './core/eigenconfig/EigenConfig';
import { ServerController } from './ServerController';
import { addFileTransport, consoleTransport, logger } from './util/logger';

const argv = yargs.usage('Usage: $0 [options]')
    .example('$0 -c ./eigenconfig.yaml',
        'starts the server with the specified location for the configuration file')
    .help('h')
    .alias('h', 'help')

    .alias('f', 'config-file')
    .default('f', './eigenconfig.yaml')
    .nargs('f', 1)
    .describe('f', 'the path to the configuration file')

    .boolean('c')
    .alias('c', 'no-color')
    .describe('c', 'disables logs coloring in the console')

    .choices('l', ['info', 'debug', 'error', 'silly'])
    .default('l', 'info')
    .alias('l', 'log-level')
    .describe('l', 'the log level to use in the console')

    .choices('k', ['info', 'debug', 'error', 'silly'])
    .default('k', 'info')
    .alias('k', 'file-log-level')
    .describe('k', 'the log level to use in the log file')

    .alias('g', 'log-file')
    .nargs('g', 1)
    .describe('g', 'the path to the log file')

    .argv;

const eigenConfigPath = argv.f;
const logFilePath = argv.g;

consoleTransport.level = argv.l;
console.log(logFilePath, argv.k);

if (isString(logFilePath)) {
    addFileTransport(logFilePath, argv.k);
}

if (!fs.existsSync(eigenConfigPath)) {
    logger.error(`Unable to find eigenconfig file at path ${eigenConfigPath}`);
    process.exit(1);
}

parseValidEigenConfig(fs.readFileSync(eigenConfigPath, 'utf-8'), dirname(eigenConfigPath)).then(async eigenConfig => {
    logger.info(inspect(eigenConfig));

    const server = new ServerController(eigenConfig);

    const signalHandler = () => {
        server.stop();
    };
    process.on('SIGINT', signalHandler);
    process.on('SIGTERM', signalHandler);

    await server.start();
}).catch(error => logger.error(error));
