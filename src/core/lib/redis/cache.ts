import { redis } from "@core/config/redis";
import { logger } from "@core/utils/logger";

export const getRedisCache = async <T>(key: string): Promise<T | null> => {
    try {
        const data = await redis.get(key);
    
        if (!data) return null;
    
        return JSON.parse(data) as T;
    }
    catch (e: any) {
        logger.warn(`Failed to parse Redis cache for key: ${key}`, e.message);
        return null;
    }
};


export const setRedisCache = async (key: string, value: unknown, ttlSeconds = 60): Promise<void> => {
    try {
        await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    }
    catch (e: any) {
        logger.warn(`Failed to set Redis cache for key: ${key}`, e.message);
    }
};


export const deleteRedisCache = async (key: string): Promise<void> => {
    try {
        await redis.del(key);
    }
    catch (e: any) {
        logger.warn(`Failed to delete Redis cache for key: ${key}`, e.message);
    }
}

export const deleteRedisCacheByPattern= async (pattern: string) => {
    let cursor = "0";

    try {
        do {
            const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    
            cursor = nextCursor;
    
            if (keys.length) {
                const pipeline = redis.pipeline();
    
                keys.forEach((key) => pipeline.del(key));
    
                await pipeline.exec();
            }
    
        } while (cursor !== "0");
    }
    catch (e: any) {
        logger.warn(`Failed to delete Redis cache by pattern: ${pattern}`, e.message);
    }
}