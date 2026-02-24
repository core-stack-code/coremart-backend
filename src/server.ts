import App from './app';
import { disconnectPrisma } from './core/config/prisma';
import { logger } from './api/utils/logger';

const serverShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await disconnectPrisma();
  process.exit(0);
};

process.on('SIGINT', () => serverShutdown('SIGINT'));
process.on('SIGTERM', () => serverShutdown('SIGTERM'));

const appServer = new App();
const server = appServer.app;


export default server;
