import "dotenv/config";
import { PrismaPg  } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";
import { logger } from "@api/utils/logger";
import { env } from "./env";


const connectionString = `${env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export const connectPrisma = async () => {
    try {
        await prisma.$connect();
        logger.info("Prisma connected successfully");
    } catch (error) {
        logger.error("Prisma connection error:", error);
        process.exit(1);
    }
};

export const disconnectPrisma = async () => {
    try {
        await prisma.$disconnect();
        logger.info('Prisma disconnected');
    } catch (error) {
        logger.error('Error disconnecting Prisma:', error);
    }
};

export { prisma }