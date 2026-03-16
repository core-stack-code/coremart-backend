import "dotenv/config";
import { PrismaPg  } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "generated/prisma/client";
import { logger } from "@core/utils/logger";
import { env } from "./env";


const connectionString = `${env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

type PrismaTx = Prisma.TransactionClient;




const connectPrisma = async () => {
    try {
        await prisma.$connect();
        logger.info("Prisma connected successfully");
    } catch (error) {
        logger.error("Prisma connection error:", error);
        process.exit(1);
    }
};

const disconnectPrisma = async () => {
    try {
        await prisma.$disconnect();
        logger.info('Prisma disconnected');
    } catch (error) {
        logger.error('Error disconnecting Prisma:', error);
    }
};


export { prisma, PrismaTx, connectPrisma, disconnectPrisma }