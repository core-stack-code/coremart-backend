import chalk from 'chalk';
import util from 'util';
import { env } from '../config/env';

const formatArgs = (args: any[]) => {
    return args.map(arg => {
        if (typeof arg === 'object') {
            return util.inspect(arg, { colors: true, depth: null });
        }
        return arg;
    });
};

const isDev = env.NODE_ENV !== 'production';

export const logger = {
    info: (...args: any[]) => {
        if (isDev) console.log(chalk.blue('[---INFO]---'), ...formatArgs(args));
    },
    success: (...args: any[]) => {
        if (isDev) console.log(chalk.green('[---SUCCESS---]'), ...formatArgs(args));
    },
    warn: (...args: any[]) => {
        if (isDev) console.log(chalk.yellow('[---WARN---]'),  ...formatArgs(args));
    },
    error: (...args: any[]) => {
        if (isDev) console.log(chalk.red('[---ERROR---]'),  ...formatArgs(args));
    },
};
