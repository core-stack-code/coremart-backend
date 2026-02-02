import crypto from "crypto";
import { env } from "@core/config/env";
import { AppError } from "@core/utils/response";

export const getState = () => {
    return crypto.randomBytes(16).toString("hex")
};

export const genrateOtpHash = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hash = 
        crypto.createHmac('sha256', env.SESSIONS_SECRET)
        .update(otp)
        .digest('hex');

    return { otp, hash };
}

export const compareOtpHash = (otp: string, hash: string): boolean => {
    const otpHash = crypto
        .createHmac('sha256', env.SESSIONS_SECRET)
        .update(otp)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(otpHash),
        Buffer.from(hash)
    );
}



const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

type LinkingStateData = {
    userId: string;
    random: string;
    expiresAt: number;
};

export const encryptLinkingState = (userId: string): string => {
    const data: LinkingStateData = {
        userId,
        random: crypto.randomBytes(16).toString('hex'),
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    const key = crypto.pbkdf2Sync(env.SESSIONS_SECRET, salt, 100000, 32, 'sha256');
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const jsonData = JSON.stringify(data);
    const encrypted = Buffer.concat([
        cipher.update(jsonData, 'utf8'),
        cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    const combined = Buffer.concat([salt, iv, authTag, encrypted]);
    
    return combined.toString('base64url');
};

export const decryptLinkingState = (encryptedState: string): LinkingStateData => {
    try {
        const combined = Buffer.from(encryptedState, 'base64url');
        
        const salt = combined.subarray(0, SALT_LENGTH);
        const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const authTag = combined.subarray(
            SALT_LENGTH + IV_LENGTH, 
            SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
        );
        const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
        
        const key = crypto.pbkdf2Sync(env.SESSIONS_SECRET, salt, 100000, 32, 'sha256');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);
        
        const data: LinkingStateData = JSON.parse(decrypted.toString('utf8'));
        
        if (Date.now() > data.expiresAt) {
            throw new AppError(400, "BAD_REQUEST",'Linking state has expired');
        }
        
        return data;
    } catch (error) {
        throw new AppError(400, "BAD_REQUEST",'Invalid or expired linking state');
    }
};