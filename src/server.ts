import App from './app';
import { disconnectDB } from './core/config/database';
import { disconnectPrisma } from './core/config/prisma';
import { logger } from './api/utils/logger';


// const startServer = async () => {
//   try {
//     await connectDB();
//     await connectPrisma();
//     app.listen(PORT, () => {
//       logger.info(`Server running... at ${PORT}`);
//     });
//   } 
//   catch (error) {
//     logger.error('Failed to start server:', error);
//   }
// };

const serverShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await disconnectDB();
  await disconnectPrisma();
  process.exit(0);
};

process.on('SIGINT', () => serverShutdown('SIGINT'));
process.on('SIGTERM', () => serverShutdown('SIGTERM'));

// startServer();


const appServer = new App();
const server = appServer.app;


export default server;
