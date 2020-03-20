import { createLogger, format, transports } from 'winston';

export const consoleTransport = new transports.Console({
    format: format.combine(
        format.colorize(),
        format.simple()),
});

export const logger = createLogger({
    level: 'silly',
    transports: [consoleTransport],
});

export function addFileTransport(filename: string, level: string) {
    logger.add(new transports.File({
        filename,
        level,
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.errors({ stack: true }),
            format.splat(),
            format.json(),
        ),
    }));
}
