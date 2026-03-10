import Redis from "ioredis";
import { logger } from "@api/utils/logger";
import { env } from "./env";

export const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        return Math.min(times * 50, 2000);
    }
});

redis.on("connect", () => {
    logger.info("Redis connected");
});

redis.on("error", (err) => {
    logger.error("Redis Client Error:", err);
});

export const disconnectRedis = async () => {
    await redis.quit();
    logger.info("Redis disconnected");
};