import { createLogger, format, transports } from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(info => {
    return `[${info.level}] ${info.timestamp} - ${info.message}`;
});

export const logger = createLogger({
    level: 'info',
    transports: [
        new transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            )
        }),
        new transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            )
        }),
        new transports.File({
            filename: path.join('logs', 'combined.log'),
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            )
        })
    ]
});
