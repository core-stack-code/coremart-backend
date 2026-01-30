import app from './app';
import { connectDB, disconnectDB } from './api/config/database';
import { env } from './api/config/env';
import { logger } from './api/utils/logger';
import { connectPrisma, disconnectPrisma } from './api/config/prisma';

const PORT = Number(env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectPrisma();
    app.listen(PORT, () => {
      logger.info(`Server running... at ${PORT}`);
    });
  } 
  catch (error) {
    logger.error('Failed to start server:', error);
  }
};

const serverShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await disconnectDB();
  await disconnectPrisma();
  process.exit(0);
};

process.on('SIGINT', () => serverShutdown('SIGINT'));
process.on('SIGTERM', () => serverShutdown('SIGTERM'));

startServer();