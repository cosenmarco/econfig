import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
    ),
    transports: [
        new transports.File({ filename: 'econfig-combined.log' }),
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()),
            }),
    ],
});

export default logger;
