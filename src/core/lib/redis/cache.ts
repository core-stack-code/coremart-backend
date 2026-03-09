import { redis } from "@core/config/redis";

export const getCache = async <T>(key: string): Promise<T | null> => {
    const data = await redis.get(key);

    if (!data) return null;

    return JSON.parse(data) as T;
};


export const setCache = async (key: string, value: unknown, ttlSeconds = 60): Promise<void> => {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
};


export const deleteCache = async (key: string): Promise<void> => {
    await redis.del(key);
}

export const deleteByPattern= async (pattern: string) => {
    let cursor = "0";

    do {
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);

        cursor = nextCursor;

        if (keys.length) {
            await redis.del(...keys);
        }

    } while (cursor !== "0");
}