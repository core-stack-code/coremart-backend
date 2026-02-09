import { v7 as uuidv7 } from "uuid";

export const getUuid = (): string => uuidv7();

export const getExpiryTime = (expiresInSeconds: number): Date => {
    const now = new Date();
    return new Date(now.getTime() + expiresInSeconds * 1000);
}

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/'/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}