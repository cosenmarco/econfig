import fs from 'fs';
import 'reflect-metadata';
import { inspect } from 'util';
import { EigenConfig, parseValidEigenConfig } from './core/eigenconfig/EigenConfig';
import logger from './core/logger';

// TODO: maybe add command line parameters to tell where config is
parseValidEigenConfig(fs.readFileSync('./eigenconfig.yaml', 'utf-8')).then(result => {
    logger.info(inspect(result));
}).catch(errors => {
    logger.error('Invalid eigenconfig. Errors: ', errors);
});
