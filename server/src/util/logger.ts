import { createLogger, format, transports } from 'winston';

export const logger = createLogger();

export function addConsoleTransport(level: string, colorize: boolean) {
    const formatsToCombine = [format.simple()];
    if (colorize) {
        formatsToCombine.unshift(format.colorize());
    }
    logger.add(new transports.Console({
        level,
        format: format.combine(...formatsToCombine),
    }));
}

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
