import { v7 as uuidv7 } from "uuid";

export const getUuid = (): string => uuidv7();

export const getExpiryTime = (expiresInSeconds: number): Date => {
    const now = new Date();
    return new Date(now.getTime() + expiresInSeconds * 1000);
}