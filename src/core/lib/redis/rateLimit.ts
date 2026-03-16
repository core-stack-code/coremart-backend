import { logger } from "@core/utils/logger";
import { redis } from "@core/config/redis";

export const checkRateLimit = async (key: string, limit: number, windowSeconds: number): Promise<boolean> => {
    try {
        const count = await redis.incr(key);
    
        if (count === 1) {
            await redis.expire(key, windowSeconds);
        }
    
        return count <= limit;
    }
    catch (e: any) {
        logger.warn(`Failed to check rate limit for key: ${key}`, e.message);
        return false;
    }
}