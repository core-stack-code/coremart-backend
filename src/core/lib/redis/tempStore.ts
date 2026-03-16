import { redis } from "@core/config/redis";
import { logger } from "@core/utils/logger";


export const setRedisTemp = async (key: string, value: unknown, ttlSeconds: number) => {
    try {
        const data =
            typeof value === "string" ? value : JSON.stringify(value);
    
        await redis.set(key, data, "EX", ttlSeconds);
    }
    catch (e: any) {
        logger.warn(`Failed to set Redis temp for key: ${key}`, e.message);
    }
}


export const getRedisTemp = async <T>(key: string): Promise<T | null> => {
    try {
        const data = await redis.get(key);

        if (!data) return null;

        try {
            return JSON.parse(data) as T;  // when data is object
        } catch {
            return data as T; // when data is just string
        }
    }
    catch (e: any) {
        logger.warn(`Failed to get Redis temp for key: ${key}`, e.message);
        return null;
    }
}


export const deleteRedisTemp = async (key: string) => {
    try {
        await redis.del(key);
    }
    catch (e: any) {
        logger.warn(`Failed to delete Redis temp for key: ${key}`, e.message);
    }
}