import chalk from 'chalk';
import util from 'util';
import { env } from '../config/env';

const formatArgs = (args: any[]) => {
    return args.map(arg => {
        if (typeof arg === 'object') {
            return util.inspect(arg, { colors: true, depth: null });
        }
        return arg;
    }).join('\n');
};

const isDev = env.NODE_ENV !== 'production';

export const log = {
    info: (text: string, ...args: any[]) => {
        if (isDev) {
            console.log(chalk.blue('[---INFO---]'), chalk.white.bgBlue.bold(` ${text} `));
            if (args.length) console.log(formatArgs(args));
        }
    },
    success: (text: string, ...args: any[]) => {
        if (isDev) {
            console.log(chalk.green('[---SUCCESS---]'), chalk.black.bgGreen.bold(` ${text} `));
            if (args.length) console.log(formatArgs(args));
        }
    },
    warn: (text: string, ...args: any[]) => {
        if (isDev) {
            console.log(chalk.yellow('[---WARN---]'), chalk.black.bgYellow.bold(` ${text} `));
            if (args.length) console.log(formatArgs(args));
        }
    },
    error: (text: string, ...args: any[]) => {
        if (isDev) {
            console.log(chalk.red('[---ERROR---]'), chalk.white.bgRed.bold(` ${text} `));
            if (args.length) console.log(formatArgs(args));
        }
    },
};
