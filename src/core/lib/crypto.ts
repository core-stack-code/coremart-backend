import crypto from "crypto";
import { env } from "@core/config/env";

export const getState = () => {
    return crypto.randomBytes(16).toString("hex")
};

export const genrateOtpHash = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hash = 
        crypto.createHmac('sha256', env.OTP_SECRETE)
        .update(otp)
        .digest('hex');

    return { otp, hash };
}

export const compareOtpHash = (otp: string, hash: string): boolean => {
    const otpHash = crypto
        .createHmac('sha256', env.OTP_SECRETE)
        .update(otp)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(otpHash),
        Buffer.from(hash)
    );
}