import App from './app';
import { disconnectPrisma } from '@core/config/prisma';
import { disconnectRedis } from '@core/config/redis';
import { logger } from './core/utils/logger';

const serverShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await disconnectPrisma();
  await disconnectRedis();
  process.exit(0);
};

process.on('SIGINT', () => serverShutdown('SIGINT'));
process.on('SIGTERM', () => serverShutdown('SIGTERM'));

const appServer = new App();
const server = appServer.app;


export default server;
