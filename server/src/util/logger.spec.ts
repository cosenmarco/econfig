import { format, transports } from 'winston';
import { logger } from './logger';

before(() => {
    logger.add(new transports.Console({
        level: 'fatal',
        format: format.simple(),
    }));
});
